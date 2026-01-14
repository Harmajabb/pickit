import type { ResultSetHeader } from "mysql2";
import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

export type CreateAnnounceInput = {
  title: string;
  description: string;
  amount_deposit: number;
  start_borrow_date: string;
  end_borrow_date: string;
  location: string;
  categorie_id: number;
  owner_id: number;
  state_of_product: string;
};

export type Announces = {
  id?: number;
  title?: string;
  description?: string;
  amount_deposit?: number;
  creation_date?: Date;
  update_date?: Date;
  start_borrow_date?: string;
  end_borrow_date?: string;
  location?: string;
  status?: string;
  all_images?: string | null;
  categorie_id?: number;
  owner_id?: number;
  state_of_product?: string;
};

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

  // Announce by owner ID.
  async readByOwnerId(ownerId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.id, announces.title, announces.location, MIN(announces_images.url) AS all_images FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id WHERE announces.owner_id = ? AND announces.status = 'active' GROUP BY announces.id ORDER BY announces.creation_date DESC",
      [ownerId],
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
      [id],
    );

    return rows[0] as Announces | undefined;
  }

  async sendCreateAnnounce(
    form: CreateAnnounceInput,
    files: Express.Multer.File[],
  ): Promise<number> {
    const connection = await databaseClient.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        `
      INSERT INTO announces
      (title, description, amount_deposit, creation_date, start_borrow_date, end_borrow_date, location, categorie_id, owner_id, state_of_product)
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)
      `,
        [
          form.title,
          form.description,
          form.amount_deposit,
          form.start_borrow_date,
          form.end_borrow_date,
          form.location,
          form.categorie_id,
          form.owner_id,
          form.state_of_product,
        ],
      );

      const announceId = result.insertId;

      if (files.length > 0) {
        const rows = files.map((f) => [f.filename, announceId]);

        await connection.query(
          "INSERT INTO announces_images (url, announce_id) VALUES ?",
          [rows],
        );
      }

      await connection.commit();
      return announceId;
    } catch (err) {
      await connection.rollback();

      // cleanup fichiers
      const fs = await import("node:fs/promises");
      const path = await import("node:path");

      await Promise.all(
        files.map((f) =>
          fs
            .unlink(
              path.join(process.cwd(), "public/assets/images", f.filename),
            )
            .catch(() => {}),
        ),
      );

      throw err;
    } finally {
      connection.release();
    }
  }

  // Update listing
  async sendUpdateAnnounce(
    id: number,
    form: Partial<
      Omit<Announces, "id" | "creation_date" | "update_date" | "all_images">
    >,
  ) {
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
