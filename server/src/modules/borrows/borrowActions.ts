import path from "node:path";
import type { Request, RequestHandler, Response } from "express";
import type { FieldPacket, RowDataPacket } from "mysql2";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import databaseClient from "../../../database/client";
import chatRepository from "../chat/chatRepository";
import userRepository from "../user/userRepository";
import borrowRepository from "./borrowRepository";

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

    // Créer automatiquement une conversation de chat entre le prêteur et l'emprunteur
    try {
      const conversation = await chatRepository.getOrCreateConversation(
        announce.owner_id,
        borrower_id,
        announces_id,
      );
      if (!conversation) {
        console.warn(
          `Could not create chat conversation for announce ${announces_id}`,
        );
      }
    } catch (chatError) {
      console.error("Error creating chat conversation:", chatError);
      // Don't return error - let the loan request succeed even if chat creation fails
    }

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
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid borrow ID" });
    }

    const borrowRows = await borrowRepository.getBorrowById(id);
    const borrow = (borrowRows as unknown as BorrowData) || null;

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
    // 0. Vérifier que l'utilisateur est authentifié
    const userId = Number(req.auth?.sub);
    if (!userId || Number.isNaN(userId)) {
      await connection.release();
      return res.status(401).json({ error: "You must be authenticated" });
    }

    // 1. Récupérer le borrow et vérifier que l'utilisateur est le borrower
    const borrowData = await borrowRepository.getBorrowById(borrowId);
    const borrow = borrowData as unknown as BorrowData;
    if (!borrow || borrow.borrower_id !== userId) {
      await connection.release();
      return res
        .status(403)
        .json({ error: "You are not authorized to secure this deposit" });
    }

    // 2. Vérité Stripe : On récupère le statut réel
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 3. Vérification : Le paiement a-t-il bien réussi ?
    if (paymentIntent.status === "succeeded") {
      // 4. Démarrage de la transaction BDD
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
          "paid",
        );

        if (availabilityRows.length > 0) {
          await borrowRepository.updateAvailability(
            connection,
            availabilityRows,
          );
        }

        // 5. Succès total : On valide tout !
        await borrowRepository.commit(connection);
        return res.status(200).json({
          success: true,
          message: "Deposit secured and dates blocked! Success.",
        });
      } catch (dbError) {
        // Oups, problème SQL (doublon de date, serveur HS...)
        console.error("error trasaction DB:", dbError);

        // 6. Annulation : On rembobine tout
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

    if (!borrowId || Number.isNaN(Number(borrowId))) {
      return res.status(400).json({ error: "Invalid borrow ID" });
    }

    const borrowIdNum = Number(borrowId);
    const borrow = await borrowRepository.getBorrowById(borrowIdNum);
    if (!borrow) {
      return res.status(404).json({ error: "Borrow not found" });
    }

    const borrowstatusupdate =
      await borrowRepository.declarereturnedDeposit(borrowIdNum);

    // Libérer la disponibilité pour les dates futures
    await borrowRepository.releaseAvailability(borrowIdNum);

    const borrowDataResult = await borrowRepository.getBorrowById(borrowIdNum);
    if (!borrowDataResult) {
      return res.status(404).json({ error: "Borrow not found after update" });
    }
    const Borrowdata = borrowDataResult as unknown as BorrowData;

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

    if (!borrowId || Number.isNaN(Number(borrowId))) {
      return res.status(400).json({ error: "Invalid borrow ID" });
    }

    const borrowIdNum = Number(borrowId);
    const borrowRows = await borrowRepository.getBorrowById(borrowIdNum);
    const borrow = borrowRows as unknown as BorrowData;
    if (!borrow) {
      return res.status(404).json({ error: "Borrow not found" });
    }

    // Check if already refunded
    if (borrow.deposit_status === "refunded") {
      return res.status(400).json({ error: "Deposit already refunded" });
    }

    // Get borrow with deposit amount details
    const borrowDetails =
      await borrowRepository.getBorrowWithDetails(borrowIdNum);
    if (!borrowDetails || !borrowDetails.amount_deposit) {
      return res.status(404).json({ error: "Deposit amount not found" });
    }

    let refund: Stripe.Response<Stripe.Refund> | null = null;

    // Only create refund if payment_intent_id exists
    if (borrow.payment_intent_id) {
      const refundParams = {
        payment_intent: borrow.payment_intent_id,
        amount: borrowDetails.amount_deposit * 100, // Convert to cents for Stripe
        expand: ["charge"],
      };
      refund = await stripe.refunds.create(refundParams);

      // Verify refund was successful
      if (refund.status !== "succeeded" && refund.status !== "pending") {
        return res.status(400).json({ error: "Refund failed", refund });
      }
    }

    // Update borrow status to 'completed' and deposit_status to 'refunded' only after successful refund
    await borrowRepository.updateStatus(borrowIdNum, "completed", "refunded");

    const borrowDataResult =
      await borrowRepository.getBorrowWithDetails(borrowIdNum);
    if (!borrowDataResult) {
      return res.status(404).json({ error: "Borrow not found after update" });
    }

    // Send email if borrower data is available (optional)
    if (borrowDataResult?.borrower_email) {
      try {
        await transporter.sendMail({
          from: '"PickIt" <contact@pickit.fr>',
          to: borrowDataResult.borrower_email,
          subject: "Deposit Refund - PickIt",
          text: `Hello ${borrowDataResult.borrower_name}, your deposit has been declared conformed and refunded.`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="cid:unique-logo-id" alt="PickIt Logo" style="width: 100px; height: auto;" />
            </div>
            <h2 style="color: #333;">Deposit Refund</h2>
            <p>Hello <strong>${borrowDataResult.borrower_name}</strong>,</p>
            <p>Great news! Your deposit has been successfully returned and confirmed. Your refund will be processed within 5 to 7 business days.</p>
            <p>Thank you for using <strong>PickIt</strong>!</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #888; text-align: center;">Need help? Contact our support at contact@pickit.fr</p>
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
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the refund if email fails
      }
    }
    return res.status(200).json({
      refund,
      success: true,
      message: "Deposit return confirmed and refunded successfully",
    });
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

    if (!borrowId || Number.isNaN(Number(borrowId))) {
      return res.status(400).json({ error: "Invalid borrow ID" });
    }

    const borrowIdNum = Number(borrowId);
    const borrowRows = await borrowRepository.getBorrowById(borrowIdNum);
    const borrow = borrowRows as unknown as BorrowData;

    if (!borrow || !borrow.payment_intent_id) {
      return res
        .status(404)
        .json({ error: "Borrow not found or Payment Intent not found" });
    }

    // Get borrow with deposit amount details
    const borrowDetails =
      await borrowRepository.getBorrowWithDetails(borrowIdNum);
    if (!borrowDetails || !borrowDetails.amount_deposit) {
      return res.status(404).json({ error: "Deposit amount not found" });
    }

    let refund: Stripe.Response<Stripe.Refund>;
    let refundAmount: number;

    if (!amount || amount <= 0) {
      // Refund full deposit amount if no specific amount provided
      refundAmount = borrowDetails.amount_deposit * 100; // Convert to cents
    } else {
      // Refund specified partial amount
      refundAmount = Math.round(amount * 100);
    }

    refund = await stripe.refunds.create({
      payment_intent: borrow.payment_intent_id,
      amount: refundAmount,
      expand: ["charge"],
    });

    if (refund.status === "succeeded" || refund.status === "pending") {
      const ownerData = await userRepository.readPrivateById(borrow.owner_id);
      const borrowerData = await userRepository.readPrivateById(
        borrow.borrower_id,
      );
      if (!ownerData || !borrowerData) {
        return res.status(404).json({ error: "Owner or Borrower not found" });
      }

      // Calculate amount refunded in euros and save it
      const amountRefundedEuros = refundAmount / 100;
      await borrowRepository.updateStatusWithRefundAmount(
        borrowIdNum,
        "object_broken",
        amountRefundedEuros,
      );

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
      });
    }
    return res.status(400).json({ error: "Refund not succeeded" });
  } catch (error) {
    console.error("Error declaring broken deposit:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
const browseByOwner: RequestHandler = async (req, res, next) => {
  try {
    const authSub = req.auth?.sub;
    if (!authSub) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const ownerId = Number(authSub);
    if (Number.isNaN(ownerId) || ownerId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const borrows = await borrowRepository.readAllByOwner(ownerId);
    res.json(borrows);
  } catch (err) {
    next(err);
  }
};

const browseByBorrower: RequestHandler = async (req, res, next) => {
  try {
    const authSub = req.auth?.sub;
    if (!authSub) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const borrowerId = Number(authSub);
    if (Number.isNaN(borrowerId) || borrowerId <= 0) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const borrows = await borrowRepository.readAllByBorrower(borrowerId);
    res.json(borrows);
  } catch (err) {
    next(err);
  }
};

const editStatus: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status, deposit_status } = req.body;

    // Si ni status ni deposit_status ne sont fournis, erreur
    if (!status && !deposit_status) {
      return res
        .status(400)
        .json({ message: "status or deposit_status is required" });
    }

    // Récupérer le borrow actuel
    const currentBorrow = await borrowRepository.getBorrowById(id);
    if (!currentBorrow) {
      return res.status(404).json({ message: "Request not found." });
    }

    const borrowData = currentBorrow as unknown as BorrowData;

    // Déterminer les valeurs à mettre à jour
    const statusToUpdate = status || borrowData.status;
    let depositStatusToUpdate = deposit_status || borrowData.deposit_status;

    // Si status passe à "confirmed", s'assurer que deposit_status est "not_paid" si non fourni
    if (
      status === "confirmed" &&
      !deposit_status &&
      borrowData.deposit_status !== "not_paid"
    ) {
      depositStatusToUpdate = "not_paid";
    }

    console.log(
      `update request ${id} from state: ${borrowData.status} to state: ${statusToUpdate}, deposit_status: ${depositStatusToUpdate}`,
    );

    const result = await borrowRepository.updateStatus(
      id,
      statusToUpdate,
      depositStatusToUpdate,
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Request not found." });
    } else {
      // Si le status passe à "confirmed", envoyer un email au borrower
      if (status === "confirmed" && borrowData.status !== "confirmed") {
        try {
          // Récupérer les données du borrow avec les infos utilisateur et annonce
          const borrowData = await borrowRepository.getBorrowWithDetails(id);

          if (borrowData?.borrower_email) {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            // Construire le lien de paiement
            const depositPaymentLink = `${process.env.CLIENT_URL}/deposit/${borrowData.id}`;

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: borrowData.borrower_email,
              subject: `Demande d'emprunt confirmée - Paiement de caution requise pour "${borrowData.announce_title}"`,
              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2>Bonjour ${borrowData.borrower_name},</h2>
                  <p>Votre demande d'emprunt a été <strong>confirmée</strong> par le propriétaire !</p>
                  
                  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>Détails de votre emprunt :</h3>
                    <p><strong>Objet :</strong> ${borrowData.announce_title}</p>
                    <p><strong>Caution requise :</strong> ${borrowData.amount_deposit}€</p>
                  </div>
                  
                  <p>Pour finaliser votre emprunt, vous devez maintenant payer la caution de <strong>${borrowData.amount_deposit}€</strong>.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${depositPaymentLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      Payer la caution maintenant
                    </a>
                  </div>
                  
                  <p>Ou cliquez sur ce lien : <a href="${depositPaymentLink}">${depositPaymentLink}</a></p>
                  
                  <p>Cordialement,<br>L'équipe PicKit</p>
                </div>
              `,
            };

            await transporter.sendMail(mailOptions);
            console.log(
              `Email de confirmation d'emprunt envoyé à ${borrowData.borrower_email}`,
            );
          }
        } catch (emailError) {
          console.error("Erreur lors de l'envoi de l'email:", emailError);
          // Ne pas échouer la mise à jour du status si l'email échoue
        }
      }

      res.json({
        message: `Status updated to: ${statusToUpdate}`,
        deposit_status: depositStatusToUpdate,
      });
    }
  } catch (err) {
    next(err);
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
  browseByOwner,
  browseByBorrower,
  editStatus,
};
