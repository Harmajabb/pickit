// imports
import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

// type
type Announces = { 
  id: number,
  title: string,
  description: string,
  amount_caution: number,
  creation_date: Date,
  update_date: Date,
  start_location_date: Date,
  end_location_date: Date,
  location: string,
  state: string,
};

// read all database
class AnnouncesRepository {
  async readAll() {
    const [rows] = await databaseClient.query<Rows>("select * from announces");

    return rows as Announces[];
  }
  async readFiltered() {
    const [rows] = await databaseClient.query<Rows>("SELECT announces.*, GROUP_CONCAT(announces_images.url SEPARATOR ';') AS all_images FROM announces LEFT JOIN announces_images ON announces.id = announces_images.announce_id GROUP BY announces.id ORDER BY creation_date DESC LIMIT 4");
    return rows as Announces[];
  }
};

export default new AnnouncesRepository();