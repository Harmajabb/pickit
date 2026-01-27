import type { ResultSetHeader, RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";

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
}
export default new FavoriteRepository();
