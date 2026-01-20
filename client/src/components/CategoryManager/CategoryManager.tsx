import { useState, useEffect, useCallback } from "react";
import CategoryItem from "../CategoryItem/CategoryItem";

export interface CategoryTree {
  id: number;
  category: string;
  parent_id: number | null;
  children: CategoryTree[];
}

function CategoryManager() {
  const base_url = import.meta.env.VITE_API_URL;
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [selectedParent, setSelectedParent] = useState<string>("");

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${base_url}/api/categories`, {
        credentials: "include"
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async () => {
    try {
      const response = await fetch(`${base_url}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: newCategory,
          parent_id: selectedParent || null,
        }),
      });
      if (response.ok) {
        setNewCategory("");
        setSelectedParent("");
        fetchCategories();
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const response = await fetch(`${base_url}/api/categories/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEdit = async (id: number, newTitle: string) => {
    try {
      const response = await fetch(`${base_url}/api/categories/${id}`, {
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newTitle }),
      });
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const renderOptions = (cats: CategoryTree[], depth = 0): JSX.Element[] => {
    return cats.flatMap((cat) => [
      <option key={cat.id} value={cat.id}>
        {"-".repeat(depth)} {cat.category}
      </option>,
      ...renderOptions(cat.children, depth + 1),
    ]);
  };

  return (
    <section>
      <h2>Category Manager</h2>
      <div style={{ marginBottom: "20px" }}>
        <select
          value={selectedParent}
          onChange={(e) => setSelectedParent(e.target.value)}
        >
          <option value="">-- No Parent (Root) --</option>
          {renderOptions(categories)}
        </select>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
        />
        <button type="button" onClick={handleAdd}>Add Category</button>
      </div>

      <ul>
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            category={cat}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </ul>
    </section>
  );
}

export default CategoryManager;