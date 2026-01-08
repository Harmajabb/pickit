// imports
import type { Result, Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

// type
type Announces = {
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

// read all database
class AnnouncesRepository {
  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.*, GROUP_CONCAT(announces_images.url) AS all_images FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id GROUP BY announces.id ORDER BY creation_date DESC",
    );

    return rows as Announces[];
  }
  async readFiltered() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.*, MIN(announces_images.url) AS all_images FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id GROUP BY announces.id ORDER BY creation_date ASC LIMIT 4",
    );
    return rows as Announces[];
  }

  // it allows searching announces with the search bar if we don't have this function
  // we can't search announces by title, description, location, owner's firstname or lastname
  async readSearch(q: string) {
    const likeQuery = `%${q}%`;

    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.*, GROUP_CONCAT(announces_images.url) AS all_images FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id JOIN users ON users.id = announces.owner_id WHERE announces.title LIKE ? OR announces.description LIKE ? OR announces.location LIKE ? OR users.firstname LIKE ? OR users.lastname LIKE ? GROUP BY announces.id ORDER BY creation_date DESC",
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery],
    );

    return rows as Announces[];
  }
}

export default new AnnouncesRepository();
