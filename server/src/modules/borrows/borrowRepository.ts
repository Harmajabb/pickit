import type { ResultSetHeader, RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";

// Types pour les données de prêt
interface BorrowData {
  announces_id: number;
  owner_id: number;
  borrower_id: number;
  borrow_date: string;
  return_date: string;
}

interface ExistingRequest {
  id: number;
  status: string;
}

interface AvailabilityCount extends RowDataPacket {
  unavailable_days: number;
}

const borrowRepository = {
  // Créer une demande de prêt
  async create(borrowData: BorrowData): Promise<number> {
    const [result] = await databaseClient.query(
      `INSERT INTO borrows 
       (announces_id, owner_id, borrower_id, borrow_date, return_date, status, deposit_status) 
       VALUES (?, ?, ?, ?, ?, 'pending', 'not_paid')`,
      [
        borrowData.announces_id,
        borrowData.owner_id,
        borrowData.borrower_id,
        borrowData.borrow_date,
        borrowData.return_date,
      ],
    );
    return (result as ResultSetHeader).insertId;
  },

  // Vérifier si une demande existe déjà
  async checkExistingRequest(
    announcesId: number,
    borrowerId: number,
  ): Promise<ExistingRequest | null> {
    const [rows] = await databaseClient.query(
      `SELECT id, status FROM borrows 
       WHERE announces_id = ? 
       AND borrower_id = ? 
       AND status IN ('pending', 'confirmed')
       LIMIT 1`,
      [announcesId, borrowerId],
    );
    return (rows as ExistingRequest[])[0] || null;
  },

  // Vérifier les disponibilités dans la table availability
  async checkAvailability(
    announcesId: number,
    borrowDate: string,
    returnDate: string,
  ): Promise<boolean> {
    const [rows] = await databaseClient.query(
      `SELECT COUNT(*) as unavailable_days
       FROM availability
       WHERE announce_id = ?
       AND date BETWEEN ? AND ?
       AND status IN ('booked', 'blocked', 'maintenance')`,
      [announcesId, borrowDate, returnDate],
    );

    // Si unavailable_days > 0, alors au moins un jour n'est pas disponible
    return (rows as AvailabilityCount[])[0].unavailable_days === 0;
  },
};

export default borrowRepository;
