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

interface BorrowWithDetails extends RowDataPacket {
  id: number;
  borrower_id: number;
  owner_id: number;
  announces_id: number;
  borrower_email: string;
  borrower_name: string;
  owner_email: string;
  owner_name: string;
  announce_title: string;
  amount_deposit: number;
  amount_refunded: number | null;
  payment_intent_id: string | null;
}

const borrowRepository = {
  // Créer une demande de prêt
  async create(borrowData: BorrowData): Promise<number> {
    // Convertir les dates au format datetime (ajout de 00:00:00)
    const borrowDateTime = new Date(borrowData.borrow_date)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    const returnDateTime = new Date(borrowData.return_date)
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);

    const [result] = await databaseClient.query(
      `INSERT INTO borrows 
       (announces_id, owner_id, borrower_id, borrow_date, return_date, status, deposit_status) 
       VALUES (?, ?, ?, ?, ?, 'pending', 'not_paid')`,
      [
        borrowData.announces_id,
        borrowData.owner_id,
        borrowData.borrower_id,
        borrowDateTime,
        returnDateTime,
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
    if (Number.isNaN(borrowId) || borrowId <= 0) {
      return null;
    }
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
          SET status = 'returned' 
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
          SET status = 'completed'
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
        b.announces_id,
        b.owner_id,
        b.borrower_id,
        b.status, 
        b.deposit_status,
        b.borrow_date, 
        b.return_date,
        COALESCE(a.title, 'Annonce supprimée') AS item_title,
        COALESCE(a.amount_deposit, 0) AS amount_deposit,
        b.amount_refunded,
        COALESCE(u.firstname, 'Utilisateur inconnu') AS borrower_name 
     FROM borrows b
     LEFT JOIN announces a ON b.announces_id = a.id
     LEFT JOIN users u ON b.borrower_id = u.id
     WHERE b.owner_id = ?`,
      [ownerId],
    );
    return rows;
  },

  async readAllByBorrower(borrowerId: number) {
    const [rows] = await databaseClient.query(
      `SELECT 
        b.id, 
        b.announces_id,
        b.owner_id,
        b.borrower_id,
        b.status, 
        b.deposit_status,
        b.borrow_date, 
        b.return_date,
        COALESCE(a.title, 'Annonce supprimée') AS item_title,
        COALESCE(a.amount_deposit, 0) AS amount_deposit,
        b.amount_refunded,
        COALESCE(u.firstname, 'Utilisateur inconnu') AS owner_name 
     FROM borrows b
     LEFT JOIN announces a ON b.announces_id = a.id
     LEFT JOIN users u ON b.owner_id = u.id
     WHERE b.borrower_id = ?`,
      [borrowerId],
    );
    return rows;
  },

  async getBorrowWithDetails(
    borrowId: number,
  ): Promise<BorrowWithDetails | null> {
    const [rows] = await databaseClient.query(
      `SELECT 
        b.id,
        b.borrower_id,
        b.owner_id,
        b.announces_id,
        b.amount_refunded,
        b.payment_intent_id,
        u.email as borrower_email,
        u.firstname as borrower_name,
        o.email as owner_email,
        o.firstname as owner_name,
        a.title as announce_title,
        a.amount_deposit
       FROM borrows b
       LEFT JOIN users u ON b.borrower_id = u.id
       LEFT JOIN users o ON b.owner_id = o.id
       LEFT JOIN announces a ON b.announces_id = a.id
       WHERE b.id = ?`,
      [borrowId],
    );
    const rowsArray = (rows as BorrowWithDetails[]) || [];
    return rowsArray.length > 0 ? rowsArray[0] : null;
  },

  async updateStatus(
    id: number,
    status: string,
    depositStatus: string,
  ): Promise<ResultSetHeader> {
    const [result] = await databaseClient.query<ResultSetHeader>(
      "UPDATE borrows SET status = ?, deposit_status = ? WHERE id = ?",
      [status, depositStatus, id],
    );
    return result;
  },

  async updateStatusWithRefundAmount(
    id: number,
    status: string,
    amountRefunded: number,
  ): Promise<ResultSetHeader> {
    const [result] = await databaseClient.query<ResultSetHeader>(
      "UPDATE borrows SET status = ?, amount_refunded = ? WHERE id = ?",
      [status, amountRefunded, id],
    );
    return result;
  },

  // Mettre à jour les borrows "confirmed" avec "paid" en "in_progress" après 1 minute
  async updateConfirmedToInProgress(): Promise<number> {
    const query = `
      UPDATE borrows 
      SET status = 'in_progress'
      WHERE status = 'confirmed' 
      AND deposit_status = 'paid'
      AND TIMESTAMPDIFF(MINUTE, update_date, NOW()) >= 1
    `;
    const [result] = await databaseClient.query<ResultSetHeader>(query);
    return result.affectedRows;
  },

  // Libérer la disponibilité quand l'article est retourné avant la date prévue
  async releaseAvailability(borrowId: number): Promise<void> {
    const query = `
      DELETE FROM availability
      WHERE borrow_id = ? AND date > CURDATE()
    `;
    await databaseClient.query(query, [borrowId]);
  },
};

export default borrowRepository;
