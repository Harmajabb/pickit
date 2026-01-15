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

export type UserPrivate = UserMember & {
  email: string;
  address: string;
};

class UserRepository {
  //public member
  async readById(id: number): Promise<UserMember | null> {
    // null for not found user
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, firstname, lastname, city, zipcode, profil_picture FROM users WHERE id = ?",
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
}

export default new UserRepository();
