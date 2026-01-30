import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Rows } from "../../../database/client";
import databaseClient from "../../../database/client";
import type { Announces } from "../announces/announcesRepository";

export interface Favorites extends RowDataPacket {
  announces_id: number;
}

class FavoriteRepository {
  async getFavoritesIDByUserID(user_id: number): Promise<Favorites[]> {
    const [rows] = await databaseClient.query<Favorites[]>(
      "SELECT announces_id FROM favorites WHERE user_id=?",
      [user_id],
    );
    return rows;
  }
  async addFavorites(user_id: number, announces_id: number) {
    const [result] = await databaseClient.query<ResultSetHeader>(
      "INSERT INTO favorites (user_id, announces_id) VALUES(?,?)",
      [user_id, announces_id],
    );
    return result;
  }
  async delFavorites(user_id: number, announces_id: number) {
    const [result] = await databaseClient.query<ResultSetHeader>(
      "DELETE FROM favorites WHERE announces_id=? AND user_id=?",
      [announces_id, user_id],
    );
    return result;
  }

  //Favorite by user id.
  async readFavoritesByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
      announces.*,
      COUNT(all_favorites.id) AS total_likes,
      GROUP_CONCAT(DISTINCT announces_images.url) AS all_images,
      user_favorites.created_at AS favorited_at
    FROM favorites AS user_favorites
    JOIN announces
      ON announces.id = user_favorites.announces_id
    LEFT JOIN announces_images
      ON announces_images.announce_id = announces.id
    LEFT JOIN favorites AS all_favorites
      ON announces.id = all_favorites.announces_id
      AND all_favorites.is_favorite = 1
    WHERE user_favorites.user_id = ?
      AND user_favorites.is_favorite = 1
      AND announces.status = 'active'
    GROUP BY announces.id, user_favorites.created_at
    ORDER BY user_favorites.created_at DESC`,
      [userId],
    );

    return rows as Announces[];
  }
}
export default new FavoriteRepository();
