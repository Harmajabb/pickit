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
  state?: string;
  all_images?: string | null;
  categorie_id?: number;
  owner_id?: number;
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

  async sendCreateAnnounce(form: Announces, files: Express.Multer.File[]) {
    // 1) Insert announcement and get insertId
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
              const full = path.join(process.cwd(), "public/assets/images", f.filename);
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
}

export default new AnnouncesRepository();
