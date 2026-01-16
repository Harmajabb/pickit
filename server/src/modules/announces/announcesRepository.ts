import type { ResultSetHeader } from "mysql2";
import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

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
  state?: string;
  all_images?: string | null;
  categorie_id?: number;
  owner_id?: number;
};
type AnnouncesFilter = {
  zipcode?: string;
  categorie_id?: number;
};

// DISTINCT to avoid carthesian products (= similar entries)
class AnnouncesRepository {
  async readAll(filters: AnnouncesFilter = {}) {
    let sql = `SELECT announces.*, users.zipcode, COUNT(DISTINCT is_favorite) AS total_likes, GROUP_CONCAT(DISTINCT announces_images.url) AS all_images 
    FROM announces 
    LEFT JOIN announces_images ON announces.id = announces_images.announce_id
    LEFT JOIN users ON owner_id = users.id
    LEFT JOIN favorites ON announces.id = favorites.announces_id`;

    console.log(filters);
    const sqlValues: (string | number)[] = [];
    const conditions: string[] = [];

    if (filters.zipcode) {
      conditions.push("announces.zipcode LIKE ?");
      sqlValues.push(`%${filters.zipcode}%`); // filters the two first numbers of the zipcode
    }

    if (filters.categorie_id) {
      conditions.push("announces.categorie_id = ?");
      sqlValues.push(filters.categorie_id);
    }

    if (conditions.length > 0) {
      sql += `WHERE ${conditions.join(" AND ")}`;
    }

    sql += " GROUP BY announces.id ORDER BY creation_date DESC";

    const [rows] = await databaseClient.query<Rows>(sql, sqlValues);

    return rows as Announces[];
  }

  async readFiltered() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.*, MIN(announces_images.url) AS all_images FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id GROUP BY announces.id ORDER BY creation_date ASC LIMIT 4",
    );
    return rows as Announces[];
  }

  // Get just one announcement with its ID
  // Announce by owner ID.
  async readByOwnerId(ownerId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.id, announces.title, announces.location, MIN(announces_images.url) AS all_images FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id WHERE announces.owner_id = ? AND announces.status = 'active' GROUP BY announces.id ORDER BY announces.creation_date DESC",
      [ownerId],
    );
    return rows as Announces[];
  }

  // Récupérer une seule annonce par son ID
  async getOne(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT announces.*, users.zipcode, users.lastname, users.fistname, COUNT(DISTINCT is.favorite) AS total_likes GROUP_CONCAT(DISTINCT announces_images.url) AS all_images
      FROM announces
      LEFT JOIN announces_images ON announces.id = announces_images.announce_id
      LEFT JOIN users ON owner.id = users.id
      LEFT JOIN favorites ON announces.id = favorites.announces_id
      WHERE announces.id = ?
      GROUP BY announces.id
      `,
      [id],
    );

    return rows[0] as Announces | undefined;
  }

  async sendCreateAnnounce(form: Announces, files: Express.Multer.File[]) {
    const insertAnnounceQuery = `
    INSERT INTO announces
    (title, description, amount_deposit, creation_date, update_date, start_borrow_date, end_borrow_date, location, state, categorie_id, owner_id)
    VALUES (?, ?, ?, NOW(), NULL, ?, ?, ?, ?, ?, ?)
  `;
    const announceValues = [
      form.title,
      form.description,
      form.amount_deposit,
      form.start_borrow_date,
      form.end_borrow_date,
      form.location,
      form.state ?? "active",
      form.categorie_id,
      form.owner_id,
    ];

    const [result] = await databaseClient.query<ResultSetHeader>(
      insertAnnounceQuery,
      announceValues,
    );
    // biome-ignore lint/suspicious/noExplicitAny: <result as any>
    const insertId = (result as any).insertId as number;
    const imagePaths: string[] = [];

    if (files.length > 0) {
      const rows = files.map((f) => {
        const rel = `assets/images/${f.filename}`;
        imagePaths.push(rel);
        return [rel, insertId];
      });

      const insertImagesQuery =
        "INSERT INTO announces_images (url, announce_id) VALUES ?";
      try {
        await databaseClient.query(insertImagesQuery, [rows]);
      } catch (err) {
        try {
          const fs = await import("node:fs/promises");
          const path = await import("node:path");
          for (const f of files) {
            const full = path.join(
              process.cwd(),
              "public/assets/images",
              f.filename,
            );
            try {
              await fs.unlink(full);
            } catch (_err) {}
          }
        } catch (_err) {}
        try {
          await databaseClient.query("DELETE FROM announces WHERE id = ?", [
            insertId,
          ]);
        } catch (_err) {}
        throw err;
      }
    }

    return {
      announceId: insertId,
      imagesCount: files.length,
      imagePaths,
    };
  }
  // Mettre à jour une annonce existante
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
