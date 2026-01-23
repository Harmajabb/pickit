import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

export type UserMember = {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  zipcode: number;
  profil_picture: string | null;
  is_banned: boolean;
  roles?: number;
  email?: string;
};

export type UserPrivate = UserMember & {
  email: string;
  address: string;
};

export type BanStatus = {
  reason: string;
  end_date: string;
};

class UserRepository {
  //public member
  async readById(id: number): Promise<UserMember | null> {
    // null for not found user
    const [rows] = await databaseClient.query<Rows>(
      "SELECT u.id, u.firstname, u.lastname, u.city, u.zipcode, u.profil_picture, (ub.id IS NOT NULL AND ub.active = 1 AND ub.end_date > NOW()) AS is_banned FROM users u LEFT JOIN user_ban ub ON u.id = ub.user_id WHERE u.id = ? ORDER BY ub.end_date DESC LIMIT 1;",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as UserMember;
  }

  // my profile
  async readPrivateById(id: number): Promise<UserPrivate | null> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, firstname, lastname, city, zipcode, address, email, profil_picture FROM users WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as UserPrivate;
  }

  async readAllMembers(): Promise<UserMember[]> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT 
          u.id, u.firstname, u.lastname, u.email, u.role, u.city, u.zipcode, u.profil_picture,
          max(CASE 
              WHEN ub.active = 1 AND ub.end_date > NOW() THEN 1 
              ELSE 0 
          END) AS is_banned
       FROM users u
       LEFT JOIN user_ban ub ON u.id = ub.user_id
       GROUP BY u.id`,
    );
    return rows as UserMember[];
  }

  async deleteById(id: number): Promise<void> {
    await databaseClient.query("DELETE FROM user_ban WHERE user_id = ?", [id]);
    await databaseClient.query("DELETE FROM users WHERE id = ?", [id]);
  }

  async ban(
    userId: number,
    adminId: number,
    reason: string,
    days: number,
  ): Promise<void> {
    const sql = `
      INSERT INTO user_ban (user_id, superuser_id, reason, end_date, active) 
      VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), 1)
    `;

    await databaseClient.query(sql, [userId, adminId, reason, days]);
  }
  async checkBanStatus(userId: number): Promise<BanStatus | null> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT reason, end_date 
       FROM user_ban 
       WHERE user_id = ? AND active = 1 AND end_date > NOW()
       ORDER BY end_date DESC 
       LIMIT 1`,
      [userId],
    );

    return rows.length > 0 ? (rows[0] as BanStatus) : null;
  }
  async unban(userId: number): Promise<void> {
    const sql = `
      UPDATE user_ban 
      SET active = 0 
      WHERE user_id = ? AND active = 1
    `;

    await databaseClient.query(sql, [userId]);
  }
  async updateRole(userId: number, newRole: number): Promise<void> {
    await databaseClient.query("UPDATE users SET role = ? WHERE id = ?", [
      newRole,
      userId,
    ]);
  }
}

export default new UserRepository();
