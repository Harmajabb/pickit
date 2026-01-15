import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

class AdminRepository {
  async getStats() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT (SELECT COUNT(*) FROM users) AS userCount, (SELECT COUNT(*) FROM reports WHERE status = 'pending' OR status = 'in_progress') AS reportCount, (SELECT COUNT(*) FROM announces WHERE status = 'active') AS announcementCount",
    );
    return rows[0]; // On retourne le premier (et seul) objet du tableau
  }
}

export default new AdminRepository();
