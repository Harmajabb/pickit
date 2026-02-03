import type { Request, RequestHandler, Response } from "express";
import type { FieldPacket, RowDataPacket } from "mysql2";
import Stripe from "stripe";
import databaseClient from "../../../database/client";
import borrowRepository from "./borrowRepository";
import userRepository from "../user/userRepository";
import nodemailer from "nodemailer";
import path from "node:path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const logoPath = path.join(process.cwd(), "../client/public/Logo_top.png");

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

interface BorrowData extends RowDataPacket {
  id: number;
  announces_id: number;
  owner_id: number;
  borrower_id: number;
  borrow_date: string;
  return_date: string;
  status: string;
  payment_intent_id?: string;
}

const getBorrowById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const borrowRows = await borrowRepository.getBorrowById(Number(id));
    const borrow: BorrowData | null =
      borrowRows && borrowRows.length > 0
        ? (borrowRows[0] as BorrowData)
        : null;

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

const declarereturnedDeposit: RequestHandler = async (req, res) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  try {
    const { borrowId } = req.body;

    const borrow = await borrowRepository.getBorrowById(borrowId);
    if (!borrow) {
      return res.status(404).json({ error: "Borrow not found" });
    }

    // Capture the payment intent to release the deposit
    const borrowstatusupdate =
      await borrowRepository.declarereturnedDeposit(borrowId);

    const borrowDataResult = await borrowRepository.getBorrowById(borrowId);
    if (!borrowDataResult || borrowDataResult.length === 0) {
      return res.status(404).json({ error: "Borrow not found after update" });
    }
    const [Borrowdata] = borrowDataResult;

    const Userdataborrow = await userRepository.readPrivateById(
      Borrowdata.borrower_id,
    );
    const UserdataOwner = await userRepository.readPrivateById(
      Borrowdata.owner_id,
    );
    if (!Userdataborrow || !UserdataOwner) {
      return res.status(404).json({ error: "User or borrower not found" });
    }
    await transporter.sendMail({
      from: '"PickIt" <contact@pickit.fr>',
      to: Userdataborrow.email,
      subject: "Deposit returned - PickIt",
      text: `Hello ${Userdataborrow.firstname}, your deposit has been returned. Please wait for confirmation.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:unique-logo-id" alt="PickIt Logo" style="width: 100px; height: auto;" />
          </div>
    
          <h2 style="color: #333;">Deposit update</h2>
          
          <p>Hello <strong>${Userdataborrow.firstname}</strong>,</p>
          
          <p>Great news! Your deposit has been successfully returned, and the owner has been notified.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px dashed #ccc;">
            <p style="margin: 0; font-weight: bold;">Status: Returned</p>
          </div>
    
          <p>Please wait for the final confirmation. We’ll keep you posted!</p>
          
          <p>Thank you for using <strong>PickIt</strong>!</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            Need help? Contact our support at contact@pickit.fr
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath, // Assurez-vous que logoPath est défini
          cid: "unique-logo-id",
        },
      ],
    });

    await transporter.sendMail({
      from: '"PickIt" <contact@pickit.fr>',
      to: UserdataOwner.email,
      subject: "Deposit returned - PickIt",
      text: `Hello ${UserdataOwner.firstname}, your deposit has been returned. Please confirm return for refund your borrower.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:unique-logo-id" alt="PickIt Logo" style="width: 100px; height: auto;" />
          </div>
    
          <h2 style="color: #333;">Deposit update</h2>
          
          <p>Hello <strong>${UserdataOwner.firstname}</strong>,</p>
          
          <p>Great news! Your deposit has been successfully returned, please confirm the return to refund on your profile your borrower.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px dashed #ccc;">
            <p style="margin: 0; font-weight: bold;">Status: Returned</p>
          </div>
          
          <p>Thank you for using <strong>PickIt</strong>!</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            Need help? Contact our support at contact@pickit.fr
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "unique-logo-id",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Deposit return declared successfully and emails sent",
      borrowstatusupdate,
    });
  } catch (error) {
    console.error("Error declaring returned deposit:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const declaredepositconformed: RequestHandler = async (req, res) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  try {
    const { borrowId } = req.body;
    const borrowRows = await borrowRepository.getBorrowById(borrowId);
    const borrow = borrowRows?.[0] as BorrowData;
    if (!borrow || !borrow.payment_intent_id) {
      return res
        .status(404)
        .json({ error: "Borrow not Borrow or Payment Intent not found" });
    }
    const refundParams = {
      payment_intent: borrow.payment_intent_id,
      expand: ["charge"],
    };
    const refund = await stripe.refunds.create(refundParams);
    if (refund.status === "succeeded" || refund.status === "pending") {
      const borrowstatusupdate =
        await borrowRepository.declareborrowconformed(borrowId);

      const borrowDataResult = await borrowRepository.getBorrowById(borrowId);
      if (!borrowDataResult || borrowDataResult.length === 0) {
        return res.status(404).json({ error: "Borrow not found after update" });
      }
      const [Borrowdata] = borrowDataResult;

      const UserdataOwner = await userRepository.readPrivateById(
        Borrowdata.owner_id,
      );
      if (!UserdataOwner || !Borrowdata) {
        return res.status(404).json({ error: "User not found" });
      }

      // Send email to owner to inform them that the deposit has been returned
      if (UserdataOwner && Borrowdata) {
        await transporter.sendMail({
          from: '"PickIt" <contact@pickit.fr>',
          to: Borrowdata.email,
          subject: "Deposit returned - PickIt",
          text: `Hello ${Borrowdata.firstname}, your deposit has been declared conformed. The refund process has been initiated for your borrower.`,
          html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:unique-logo-id" alt="PickIt Logo" style="width: 100px; height: auto;" />
          </div>
    
          <h2 style="color: #333;">Deposit update</h2>
          
          <p>Hello <strong>${Borrowdata.firstname}</strong>,</p>
          
          <p>Great news! Your deposit has been successfully returned and confirmed by <strong>${UserdataOwner.firstname}</strong>, your refund process will take 5 to 7 business days.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px dashed #ccc;">
            <p style="margin: 0; font-weight: bold;">Status: Returned</p>
          </div>
          
          <p>Thank you for using <strong>PickIt</strong>!</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            Need help? Contact our support at contact@pickit.fr
          </p>
        </div>
      `,
          attachments: [
            {
              filename: "logo.png",
              path: logoPath,
              cid: "unique-logo-id",
            },
          ],
        });

        await transporter.sendMail({
          from: '"PickIt" <contact@pickit.fr>',
          to: Borrowdata.email,
          subject: "Deposit returned - PickIt",
          text: `Hello ${Borrowdata.firstname}, your trasaction with ${UserdataOwner.firstname} has been close and refund. The refund process has been initiated for your borrower.`,
          html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:unique-logo-id" alt="PickIt Logo" style="width: 100px; height: auto;" />
          </div>
    
          <h2 style="color: #333;">Deposit update</h2>
          
          <p>Hello <strong>${Borrowdata.firstname}</strong>,</p>
          
          <p>Great news! Your deposit has been successfully returned and confirmed, your refund borrower process will take 5 to 7 business days.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px dashed #ccc;">
            <p style="margin: 0; font-weight: bold;">Status: Returned</p>
          </div>
          
          <p>Thank you for using <strong>PickIt</strong>!</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            Need help? Contact our support at contact@pickit.fr
          </p>
        </div>
      `,
          attachments: [
            {
              filename: "logo.png",
              path: logoPath,
              cid: "unique-logo-id",
            },
          ],
        });
      }
      return res.status(200).json({
        refund,
        success: true,
        message: "Deposit return confirmed successfully",
        borrowstatusupdate,
      });
    }
    return res.status(400).json({ error: "Refund not succeeded" });
  } catch (error) {
    console.error("Error confirming returned deposit:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
const declaredepositbroken: RequestHandler = async (req, res) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  try {
    const { borrowId, amount, reason } = req.body;
    const borrowRows = await borrowRepository.getBorrowById(borrowId);
    const borrow = borrowRows?.[0] as BorrowData;

    if (!borrow || !borrow.payment_intent_id) {
      return res
        .status(404)
        .json({ error: "Borrow not Borrow or Payment Intent not found" });
    }

    let refund: Stripe.Response<Stripe.Refund>;

    if (!amount || amount <= 0) {
      refund = await stripe.refunds.create({
        payment_intent: borrow.payment_intent_id,
        expand: ["charge"],
      });
    } else {
      refund = await stripe.refunds.create({
        payment_intent: borrow.payment_intent_id,
        amount: Math.round(amount * 100),
        expand: ["charge"],
      });
    }

    if (refund.status === "succeeded" || refund.status === "pending") {
      const ownerData = await userRepository.readPrivateById(borrow.owner_id);
      const borrowerData = await userRepository.readPrivateById(
        borrow.borrower_id,
      );
      if (!ownerData || !borrowerData) {
        return res.status(404).json({ error: "Owner or Borrower not found" });
      }

      const borrowstatusupdate =
        await borrowRepository.declareborrowrejected(borrowId);

      await transporter.sendMail({
        from: '"PickIt" <contact@pickit.fr>',
        to: borrowerData.email,
        subject: "Deposit partial refund - PickIt",
        text: `Hello ${borrowerData.firstname}, your deposit has not been fully refunded for ${reason}. Please check your PickIt account for details.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:unique-logo-id" alt="PickIt Logo" style="width: 100px; height: auto;" />
          </div>
    
          <h2 style="color: #333;">Deposit update</h2>
          
          <p>Hello <strong>${borrowerData.firstname}</strong>,</p>
          
          <p>Unfortunately, your deposit has not been fully refunded for ${reason}. Please check your PickIt account for details.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px dashed #ccc;">
            <p style="margin: 0; font-weight: bold;">Status: Returned</p>
          </div>
          
          <p>Thank you for using <strong>PickIt</strong>!</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            Need help? Contact our support at contact@pickit.fr
          </p>
        </div>
      `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "unique-logo-id",
          },
        ],
      });

      await transporter.sendMail({
        from: '"PickIt" <contact@pickit.fr>',
        to: ownerData.email,
        subject: "Deposit partial refund - PickIt",
        text: `Hello ${ownerData.firstname}, the deposit for your borrower has not been fully refunded. Please check your PickIt account for details.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333;">
          
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="cid:unique-logo-id" alt="PickIt Logo" style="width: 100px; height: auto;" />
          </div>
    
          <h2 style="color: #333;">Deposit update</h2>
          
          <p>Hello <strong>${ownerData.firstname}</strong>,</p>
          
          <p>The deposit for your borrower has not been fully refunded. Please check your PickIt account for details.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; border: 1px dashed #ccc;">
            <p style="margin: 0; font-weight: bold;">Status: Returned</p>
          </div>
          
          <p>Thank you for using <strong>PickIt</strong>!</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            Need help? Contact our support at contact@pickit.fr
          </p>
        </div>
      `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "unique-logo-id",
          },
        ],
      });

      return res.status(200).json({
        refund,
        success: true,
        message: "Deposit broken declared successfully",
        borrowstatusupdate,
      });
    }
    return res.status(400).json({ error: "Refund not succeeded" });
  } catch (error) {
    console.error("Error declaring broken deposit:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default {
  secureDeposit,
  createPaymentIntent,
  createLoanRequest,
  getBorrowById,
  declarereturnedDeposit,
  declaredepositconformed,
  declaredepositbroken,
};
