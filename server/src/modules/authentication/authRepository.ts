import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

class AuthRepository {
  async readByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    return rows[0];
  }
}

export default new AuthRepository();
