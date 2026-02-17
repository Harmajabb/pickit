import type { Result, Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

type report = {
  reporter_id: number;
  description: string | null;
  status: string;
  reported_user_id: number | null;
  reported_conversations_id: number | null;
  reported_announce_id: number | null;
  reason?: string;
};

class reportRepository {
  async create(reports: report) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO reports (
        reporter_id, 
        description, 
        creation_date,
        reason,
        status, 
        reported_user_id, 
        reported_conversations_id, 
        reported_announce_id
      ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)`,
      [
        reports.reporter_id,
        reports.description,
        reports.reason || null,
        reports.status,
        reports.reported_user_id,
        reports.reported_conversations_id,
        reports.reported_announce_id,
      ],
    );
    return result;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT r.*, 
        u_reporter.firstname AS reporter_firstname, 
        u_reporter.lastname AS reporter_lastname,
        u_reported.firstname AS reported_firstname, 
        u_reported.lastname AS reported_lastname
      FROM reports r
      LEFT JOIN users u_reporter ON r.reporter_id = u_reporter.id
      LEFT JOIN users u_reported ON r.reported_user_id = u_reported.id
      ORDER BY r.creation_date DESC`,
    );
    return rows;
  }

  async readById(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT r.*, 
        u_reporter.firstname AS reporter_firstname, 
        u_reporter.lastname AS reporter_lastname,
        u_reported.firstname AS reported_firstname, 
        u_reported.lastname AS reported_lastname
      FROM reports r
      LEFT JOIN users u_reporter ON r.reporter_id = u_reporter.id
      LEFT JOIN users u_reported ON r.reported_user_id = u_reported.id
      WHERE r.id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async update(
    id: number,
    status: string,
    handledBy: number,
    resolutionNote: string | null,
  ) {
    const [result] = await databaseClient.query<Result>(
      "UPDATE reports SET status = ?, handled_by = ?, resolution_note = ? WHERE id = ?",
      [status, handledBy, resolutionNote, id],
    );
    return result;
  }

  async deleteById(id: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM reports WHERE id = ?",
      [id],
    );
    return result;
  }
}

export default new reportRepository();
