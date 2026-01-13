import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

export type UserMember = {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  zipcode: number;
  profil_picture: string | null;
};

class UserRepository {
  async readById(id: number): Promise<UserMember | null> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, firstname, lastname, city, zipcode, profil_picture FROM users WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as UserMember;
  }
}

export default new UserRepository();
