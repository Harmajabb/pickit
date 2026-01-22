import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

export type UserMember = {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  zipcode: string;
  profil_picture: string | null;
};

export type UserPrivate = UserMember & {
  email: string;
  address: string;
};

export type UserUpdateData = {
  firstname?: string;
  lastname?: string;
  email?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  profil_picture?: string | null;
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

  //security: verify if this email already exist
  async checkExistEmail(
    email: string,
    excludeUserId: number,
  ): Promise<boolean> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, excludeUserId],
    );
    return rows.length > 0;
  }

  // update private profile
  async update(id: number, data: UserUpdateData): Promise<UserPrivate | null> {
    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (data.firstname !== undefined) {
      fields.push("firstname = ?");
      values.push(data.firstname);
    }
    if (data.lastname !== undefined) {
      fields.push("lastname = ?");
      values.push(data.lastname);
    }
    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email);
    }
    if (data.address !== undefined) {
      fields.push("address = ?");
      values.push(data.address);
    }
    if (data.city !== undefined) {
      fields.push("city = ?");
      values.push(data.city);
    }
    if (data.zipcode !== undefined) {
      fields.push("zipcode = ?");
      values.push(data.zipcode);
    }
    if (data.profil_picture !== undefined) {
      fields.push("profil_picture = ?");
      values.push(data.profil_picture);
    }

    if (fields.length === 0) {
      return this.readPrivateById(id);
    }
    values.push(id.toString());

    await databaseClient.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return this.readPrivateById(id);
  }
}

export default new UserRepository();
