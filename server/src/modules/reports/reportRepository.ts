import type { Result } from "../../../database/client";
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
}

export default new reportRepository();
