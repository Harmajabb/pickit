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
  categorie_id: number;
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
  
  // Récupérer une seule annonce par son ID
  async readOne(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT announces.*, GROUP_CONCAT(announces_images.url) AS all_images
      FROM announces
      LEFT JOIN announces_images ON announces.id = announces_images.announce_id
      WHERE announces.id = ?
      GROUP BY announces.id
      `,
      [id]
    );

    return rows[0] as Announces | undefined;
  }

  async sendCreateAnnounce(form: Announces) {
    const query =
      "INSERT INTO announces (title, description, amount_deposit, creation_date, update_date, location, state, start_borrow_date, end_borrow_date, categorie_id, owner_id) VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?)";

    const values = [
      form.title,
      form.description,
      form.amount_deposit,
      form.location,
      form.state,
      form.start_borrow_date,
      form.end_borrow_date,
      form.categorie_id,
      1, // owner_id temporaire
    ];

    await databaseClient.query<Rows>(query, values);
  }
  // Mettre à jour une annonce existante
  async sendUpdateAnnounce(id: number, form: Partial<Omit<Announces, "id" | "creation_date" | "update_date" | "all_images">>) {
    const query = `
      UPDATE announces
      SET title = ?, description = ?, amount_deposit = ?, location = ?, start_borrow_date = ?, end_borrow_date = ?, categorie_id = ?, update_date = NOW()
      WHERE id = ?
    `;

    const values = [
      form.title,
      form.description,
      form.amount_deposit,
      form.location,
      form.start_borrow_date,
      form.end_borrow_date,
      form.categorie_id,
      id,
    ];

    await databaseClient.query<Rows>(query, values);
  }
}

export default new AnnouncesRepository();
