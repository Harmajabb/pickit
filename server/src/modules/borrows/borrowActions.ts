import type { Request, Response } from "express";
import type { FieldPacket, RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";
import borrowRepository from "./borrowRepository";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: number;
  };
}

interface LoanRequestBody {
  announces_id: number;
  borrow_date: string;
  return_date: string;
}

interface AnnounceData extends RowDataPacket {
  id: number;
  owner_id: number;
  title: string;
  status: string;
}

const borrowActions = {
  // Créer une demande de prêt
  async createLoanRequest(
    req: AuthenticatedRequest &
      Request<Record<string, never>, Record<string, never>, LoanRequestBody>,
    res: Response,
  ): Promise<Response> {
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
  },
};

export default borrowActions;
