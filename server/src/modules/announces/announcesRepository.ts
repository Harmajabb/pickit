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

  async createAnnouce(form: Announces) {
    const query = `
      INSERT INTO announces 
      (title, description, amount_deposit, creation_date, update_date, location, state) 
      VALUES (?, ?, ?, NOW(), NOW(), ?, ?)
    `;

    const values = [
      form.title,
      form.description,
      form.amount_deposit,
      form.location,
      form.state,
    ];

    await databaseClient.query<Rows>(query, values);
  }
}

export default new AnnouncesRepository();
