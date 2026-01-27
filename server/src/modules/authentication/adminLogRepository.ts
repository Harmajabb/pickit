import databaseClient from "../../../database/client";

export type AdminLog = {
  id: number;
  superuser_id: number;
  action_type: string;
  target_table: string;
  target_id: number;
  details: string;
  timestamp: string;
};

class AdminLogRepository {
  async create(logData: Omit<AdminLog, "id" | "timestamp">) {
    const params = [
      logData.superuser_id ?? null,
      logData.action_type ?? null,
      logData.target_table ?? null,
      logData.target_id ?? null,
      logData.details ?? null,
    ];
    const sql = `
      INSERT INTO admin_logs (superuser_id, action_type, target_table, target_id, details)
      VALUES (?, ?, ?, ?, ?)
  `;
    return await databaseClient.execute(sql, params);
  }
}
export default new AdminLogRepository();
