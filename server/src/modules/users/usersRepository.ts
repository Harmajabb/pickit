// import
import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

type UserSearch = {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  profil_picture: string | null;
};

class UsersRepository {
  async search(q: string) {
    // Prepare the search query with wildcards
    const likeQuery = `%${q}%`;

    // Execute the query to search users by firstname, lastname, or city
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, firstname, lastname, city, profil_picture FROM users WHERE firstname LIKE ? OR lastname LIKE ? OR city LIKE ? ORDER BY lastname ASC LIMIT 20",
      [likeQuery, likeQuery, likeQuery],
    );

    return rows as UserSearch[];
  }
}

export default new UsersRepository();
