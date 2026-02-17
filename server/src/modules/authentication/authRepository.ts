import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";
import type { TypesRegister } from "./authTypes";

class AuthRepository {
  async checkbanned(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ub.* FROM user_ban ub WHERE ub.user_id = ? AND ub.active = 1 AND ub.end_date > NOW() ORDER BY ub.end_date DESC LIMIT 1",
      [userId],
    );

    return rows[0];
  }
  async readById(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );

    return rows[0];
  }
  async readByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    return rows[0];
  }

  async updatePassword(id: number, newPassword: string) {
    await databaseClient.query("UPDATE users SET password = ? WHERE id = ?", [
      newPassword,
      id,
    ]);
  }

  async updateRefreshToken(userId: number, refreshToken: string | null) {
    const [result] = await databaseClient.query(
      "UPDATE users SET token7d = ? WHERE id = ?",
      [refreshToken, userId],
    );
    return result;
  }

  async createUser(form: TypesRegister, hashedPassword: string) {
    await databaseClient.query(
      "INSERT INTO users (firstname, lastname, zipcode, city, address, email, password, create_date, update_date, role) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)",
      [
        form.firstName,
        form.lastName,
        form.zipcode,
        form.city,
        form.adress,
        form.email,
        hashedPassword,
        0,
      ],
    );
  }
}
export default new AuthRepository();
