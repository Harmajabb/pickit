import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import type { Rows } from "../../../database/client";
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
  async getBorrowById(borrowId: number): Promise<Rows | null> {
    const [rows] = await databaseClient.query(
      "SELECT * FROM borrows WHERE id = ?",
      [borrowId],
    );
    return (rows as Rows[])[0] || null;
  },
  async beginTransaction(connection: PoolConnection): Promise<void> {
    await connection.query("START TRANSACTION");
  },
  async commit(connection: PoolConnection): Promise<void> {
    await connection.query("COMMIT");
  },
  async rollback(connection: PoolConnection): Promise<void> {
    await connection.query("ROLLBACK");
  },
  async updateDeposit(
    connection: PoolConnection,
    borrowId: number,
    paymentIntentId: string,
    status: string,
  ): Promise<ResultSetHeader> {
    const query = `
          UPDATE borrows 
          SET payment_intent_id = ?, deposit_status = ? 
          WHERE id = ?
        `;
    const [result] = await connection.query<ResultSetHeader>(query, [
      paymentIntentId,
      status,
      borrowId,
    ]);
    return result;
  },
  async updateAvailability(
    connection: PoolConnection,
    availabilityRows: (string | number)[][],
  ): Promise<ResultSetHeader> {
    const query = `
    INSERT INTO availability (announce_id, date, status) 
    VALUES ? 
    ON DUPLICATE KEY UPDATE status = VALUES(status);
        `;

    const [result] = await connection.query<ResultSetHeader>(query, [
      availabilityRows,
    ]);
    return result;
  },
  async declarereturnedDeposit(borrowId: number): Promise<ResultSetHeader> {
    const query = `
          UPDATE borrows 
          SET deposit_status = 'returned' 
          WHERE id = ?
        `;
    const [result] = await databaseClient.query<ResultSetHeader>(query, [
      borrowId,
    ]);
    return result;
  },
  async declareborrowconformed(borrowId: number): Promise<ResultSetHeader> {
    const query = `
          UPDATE borrows 
          SET status = 'completed',
          WHERE id = ?
        `;
    const [result] = await databaseClient.query<ResultSetHeader>(query, [
      borrowId,
    ]);
    return result;
  },
  async declareborrowrejected(borrowId: number): Promise<ResultSetHeader> {
    const query = `
          UPDATE borrows 
          SET status = 'object_broken'
          WHERE id = ?
        `;
    const [result] = await databaseClient.query<ResultSetHeader>(query, [
      borrowId,
    ]);
    return result;
  },

  async readAllByOwner(ownerId: number) {
    const [rows] = await databaseClient.query(
      `SELECT 
        b.id, 
        b.status, 
        b.borrow_date, 
        b.return_date,
        COALESCE(a.title, 'Annonce supprimée') AS item_title, 
        COALESCE(u.firstname, 'Utilisateur inconnu') AS borrower_name 
     FROM borrows b
     LEFT JOIN announces a ON b.announces_id = a.id
     LEFT JOIN users u ON b.borrower_id = u.id
     WHERE b.owner_id = ?`,
      [ownerId],
    );
    return rows;
  },

  async updateStatus(id: number, status: string) {
    const [result] = await databaseClient.query<ResultSetHeader>(
      "UPDATE borrows SET status = ? WHERE id = ?",
      [status, id],
    );
    return result;
  },
};

export default borrowRepository;
