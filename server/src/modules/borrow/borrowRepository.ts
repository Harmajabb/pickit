import type { ResultSetHeader } from "mysql2";
import databaseClient from "../../../database/client";

class BorrowRepository {
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
  }

  async updateStatus(id: number, status: string) {
    const [result] = await databaseClient.query<ResultSetHeader>(
      "UPDATE borrows SET status = ? WHERE id = ?",
      [status, id],
    );
    return result;
  }
}

export default new BorrowRepository();
