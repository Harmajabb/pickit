import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

export type SearchTab = "announces" | "users";

// for search announces
type SearchAnnounceRow = {
  id: number;
  title: string;
  location: string;
};

// for search users
type SearchUserRow = {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  profil_picture: string;
};

// for announces catalog
type FullAnnounceRow = {
  id: number;
  title: string;
  description: string;
  amount_deposit: number;
  creation_date: Date;
  update_date: Date;
  start_borrow_date: Date;
  end_borrow_date: Date;
  location: string;
  state: string;
  all_images: string | null;
};

class SearchRepository {
  async searchAnnounces(q: string) {
    const likeQuery = `%${q}%`;
    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.id, announces.title, announces.location FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id JOIN users ON users.id = announces.owner_id WHERE announces.title LIKE ? OR announces.description LIKE ? OR announces.location LIKE ? OR users.firstname LIKE ? OR users.lastname LIKE ? GROUP BY announces.id ORDER BY creation_date DESC",
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery],
    );
    return rows as SearchAnnounceRow[];
  }

  async searchUsers(q: string) {
    const likeQuery = `%${q}%`;
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, firstname, lastname, city, profil_picture FROM users WHERE firstname LIKE ? OR lastname LIKE ? OR city LIKE ? ORDER BY lastname ASC LIMIT 20",
      [likeQuery, likeQuery, likeQuery],
    );
    return rows as SearchUserRow[];
  }

  async searchFullAnnounces(q: string) {
    const likeQuery = `%${q}%`;
    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.*, GROUP_CONCAT(announces_images.url) AS all_images FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id JOIN users ON users.id = announces.owner_id WHERE announces.title LIKE ? OR announces.description LIKE ? OR announces.location LIKE ? OR users.firstname LIKE ? OR users.lastname LIKE ? GROUP BY announces.id ORDER BY creation_date DESC",
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery],
    );
    return rows as FullAnnounceRow[];
  }
}

export default new SearchRepository();
