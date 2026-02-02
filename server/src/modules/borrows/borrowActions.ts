import type { Request, RequestHandler, Response } from "express";
import type { FieldPacket, RowDataPacket } from "mysql2";
import Stripe from "stripe";
import databaseClient from "../../../database/client";
import borrowRepository from "./borrowRepository";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: number;
  };
}

interface AnnounceData extends RowDataPacket {
  id: number;
  owner_id: number;
  title: string;
  status: string;
}
const createLoanRequest: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const { announces_id, borrow_date, return_date } = req.body;
    const borrower_id = req.user?.id;

    // Vérifier que l'utilisateur est authentifié
    if (!borrower_id) {
      return res.status(401).json({
        error: "You must be authenticated to submit a loan request",
      });
    }

    // Validation des champs requis
    if (!announces_id || !borrow_date || !return_date) {
      return res.status(400).json({
        error:
          "The fields announces_id, borrow_date, and return_date are required",
      });
    }

    // Vérifier que les dates sont valides
    const borrowDateObj = new Date(borrow_date);
    const returnDateObj = new Date(return_date);

    if (returnDateObj <= borrowDateObj) {
      return res.status(400).json({
        error: "The return date must be after the borrow date",
      });
    }

    // Récupérer l'annonce pour vérifier le propriétaire
    const [announceRows] = (await databaseClient.query(
      "SELECT id, owner_id, title, status FROM announces WHERE id = ?",
      [announces_id],
    )) as [AnnounceData[], FieldPacket[]];

    if (!announceRows || announceRows.length === 0) {
      return res.status(404).json({
        error: "Announcement not found",
      });
    }

    const announce = announceRows[0];

    // Vérifier que l'annonce est active
    if (announce.status !== "active") {
      return res.status(400).json({
        error: "This announcement is no longer available",
      });
    }

    // L'utilisateur ne peut pas emprunter ses propres annonces
    if (announce.owner_id === borrower_id) {
      return res.status(403).json({
        error: "You cannot borrow your own equipment",
      });
    }

    // Vérifier si une demande existe déjà pour cette annonce par cet utilisateur
    const existingRequest = await borrowRepository.checkExistingRequest(
      announces_id,
      borrower_id,
    );

    if (existingRequest) {
      return res.status(409).json({
        error: `You already have a ${existingRequest.status === "pending" ? "pending" : "confirmed"} request for this announcement`,
      });
    }

    // Vérifier la disponibilité pour les dates demandées
    const isAvailable = await borrowRepository.checkAvailability(
      announces_id,
      borrow_date,
      return_date,
    );

    if (!isAvailable) {
      return res.status(409).json({
        error: "These dates are not available for this equipment.",
      });
    }

    // Créer la demande avec le statut "pending"
    const loanRequestId = await borrowRepository.create({
      announces_id,
      owner_id: announce.owner_id,
      borrower_id,
      borrow_date,
      return_date,
    });

    // Créer une notification pour le prêteur
    await databaseClient.query(
      `INSERT INTO messages (subject, message, user_id, announce_id, status)
         VALUES (?, ?, ?, ?, 'sent')`,
      [
        "New loan request",
        `You have received a loan request for your listing "${announce.title}"`,
        announce.owner_id,
        announces_id,
      ],
    );

    return res.status(201).json({
      message: "Loan request sent successfully",
      loan_request_id: loanRequestId,
    });
  } catch (error) {
    console.error("Error while creating loan request:", error);
    return res.status(500).json({
      error: "Server error while creating loan request",
    });
  }
};

const getBorrowById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const borrow = await borrowRepository.getBorrowById(Number(id));

    if (!borrow) {
      return res.status(404).json({ error: "Borrow not found" });
    }

    return res.status(200).json(borrow);
  } catch (error) {
    console.error("Error fetching borrow by ID:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
const secureDeposit: RequestHandler = async (req, res) => {
  const connection = await databaseClient.getConnection();
  const {
    paymentIntentId,
    borrowId,
    announceId,
    start_borrow_date,
    end_borrow_date,
  } = req.body;

  try {
    // 1. Vérité Stripe : On récupère le statut réel
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 2. Vérification : L'empreinte est-elle bien posée ?
    if (paymentIntent.status === "requires_capture") {
      // 3. Démarrage de la transaction BDD
      await borrowRepository.beginTransaction(connection);

      try {
        // A. Préparation des dates à bloquer
        const availabilityRows = [];
        const curr = new Date(start_borrow_date);
        const end = new Date(end_borrow_date);

        while (curr <= end) {
          const year = curr.getFullYear();
          const month = String(curr.getMonth() + 1).padStart(2, "0");
          const day = String(curr.getDate()).padStart(2, "0");
          const formatted = `${year}-${month}-${day}`;

          availabilityRows.push([announceId, formatted, "booked"]);

          curr.setDate(curr.getDate() + 1);
        }

        // B. Mise à jour de la caution dans 'borrows'
        await borrowRepository.updateDeposit(
          connection,
          borrowId,
          paymentIntent.id,
          "deposit_secured",
        );

        if (availabilityRows.length > 0) {
          await borrowRepository.updateAvailability(
            connection,
            availabilityRows,
          );
        }

        // 4. Succès total : On valide tout !
        await borrowRepository.commit(connection);
        return res.status(200).json({
          success: true,
          message: "Deposit secured and dates blocked! Success.",
        });
      } catch (dbError) {
        // Oups, problème SQL (doublon de date, serveur HS...)
        console.error("error trasaction DB:", dbError);

        // 5. Annulation : On rembobine tout
        await borrowRepository.rollback(connection);

        return res.status(500).json({
          success: false,
          error: "Error during database transaction.",
        });
      }
    } else {
      // Le statut Stripe n'est pas bon
      return res.status(400).json({
        success: false,
        error: "Payment intent status is not valid for capturing deposit.",
      });
    }
  } catch (stripeError) {
    console.error("Erreur Stripe:", stripeError);
    return res.status(500).json({
      success: false,
      error: "Error retrieving payment intent from Stripe.",
    });
  }
};

const createPaymentIntent: RequestHandler = async (req, res) => {
  try {
    const { amount } = req.body;
    const convertedAmount = Math.round(amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertedAmount,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      capture_method: "manual",
    });

    // Sending the key to the frontend
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ error: errorMessage });
  }
};

export default {
  secureDeposit,
  createPaymentIntent,
  createLoanRequest,
  getBorrowById,
};
