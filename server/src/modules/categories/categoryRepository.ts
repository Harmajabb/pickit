import type { Result, Rows } from "../../../database/client";
import databaseClient from "../../../database/client";

export type Category = {
  id: number;
  category: string;
  parent_id: number | null;
};

class CategoryRepository {
  // Create
  async create(category: Omit<Category, "id">) {
    const [result] = await databaseClient.query<Result>(
      "insert into categories (category, parent_id) values (?, ?)",
      [category.category, category.parent_id],
    );
    return result.insertId;
  }

  // Read (Single)
  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "select * from categories where id = ?",
      [id],
    );
    return rows[0] as Category;
  }

  // Read (All)
  async readAll() {
    const [rows] = await databaseClient.query<Rows>("select * from categories");
    return rows as Category[];
  }

  // Update
  async update(category: Category) {
    const [result] = await databaseClient.query<Result>(
      "update categories set category = ?, parent_id = ? where id = ?",
      [category.category, category.parent_id, category.id],
    );
    return result.affectedRows;
  }

  // Delete
  async delete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "delete from categories where id = ?",
      [id],
    );
    return result.affectedRows;
  }
}

export default new CategoryRepository();
