import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

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
  status: string;
  all_images: string | null;
};

class SearchRepository {
  async searchAnnounces(q: string) {
    const likeQuery = `%${q}%`;
    const [rows] = await databaseClient.query<Rows>(
      "SELECT announces.id, announces.title, announces.location FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id JOIN users ON users.id = announces.owner_id WHERE announces.title LIKE ? OR announces.description LIKE ? OR announces.location LIKE ? OR users.firstname LIKE ? OR users.lastname LIKE ? OR CONCAT(firstname, ' ', lastname) LIKE ? OR CONCAT(lastname, ' ', firstname) LIKE ? GROUP BY announces.id ORDER BY creation_date DESC",
      [
        likeQuery,
        likeQuery,
        likeQuery,
        likeQuery,
        likeQuery,
        likeQuery,
        likeQuery,
      ],
    );
    return rows as SearchAnnounceRow[];
  }

  async searchUsers(q: string) {
    const likeQuery = `%${q}%`;
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, firstname, lastname, city, profil_picture FROM users WHERE firstname LIKE ? OR lastname LIKE ? OR city LIKE ? OR CONCAT(firstname, ' ', lastname) LIKE ? OR CONCAT(lastname, ' ', firstname) LIKE ? ORDER BY lastname ASC LIMIT 20",
      [likeQuery, likeQuery, likeQuery, likeQuery, likeQuery],
    );
    return rows as SearchUserRow[];
  }

  async searchFullAnnounces(filters: {
    q: string;
    zipcode?: string;
    category_id?: string;
  }) {
    const { q, zipcode, category_id } = filters;
    const likeQuery = `%${q}%`;

    let sql = `
    SELECT 
      announces.id,
      announces.title,
      announces.description,
      announces.amount_deposit,
      announces.location,
      announces.status,
      announces.category_id,
      announces.creation_date,
      GROUP_CONCAT(DISTINCT announces_images.url) AS all_images 
    FROM announces 
    LEFT JOIN announces_images ON announces.id = announces_images.announce_id 
    JOIN users ON users.id = announces.owner_id 
    WHERE (announces.title LIKE ? 
       OR announces.description LIKE ? 
       OR announces.location LIKE ? 
       OR users.firstname LIKE ? 
       OR users.lastname LIKE ? 
       OR CONCAT(firstname, ' ', lastname) LIKE ? 
       OR CONCAT(lastname, ' ', firstname) LIKE ?)
  `;

    const sqlValues: (string | number)[] = [
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
      likeQuery,
    ];

    if (zipcode) {
      sql += " AND users.zipcode LIKE ?";
      sqlValues.push(`${zipcode}%`);
    }

    if (category_id) {
      sql += " AND announces.category_id = ?";
      sqlValues.push(category_id);
    }

    sql += " GROUP BY announces.id ORDER BY creation_date DESC";
    const [rows] = await databaseClient.query<Rows>(sql, sqlValues);
    return rows as FullAnnounceRow[];
  }
}

export default new SearchRepository();
