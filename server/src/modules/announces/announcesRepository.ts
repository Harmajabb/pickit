// imports
import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

// type
type Announces = {
  id: number;
  title: string;
  description: string;
  amount_caution: number;
  creation_date: Date;
  update_date: Date;
  start_location_date: Date;
  end_location_date: Date;
  location: string;
  state: string;
};

// read all database
class AnnouncesRepository {
  async readAll() {
    const [rows] = await databaseClient.query<Rows>("select * from announces");

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
      (title, description, amount_caution, creation_date, update_date, location, state) 
      VALUES (?, ?, ?, NOW(), NOW(), ?, ?)
    `;

    const values = [
      form.title,
      form.description,
      form.amount_caution,
      form.location,
      form.state,
    ];

    await databaseClient.query<Rows>(query, values);
  }
}

export default new AnnouncesRepository();
