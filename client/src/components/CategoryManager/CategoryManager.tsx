import { useCallback, useEffect, useState } from "react";
import CategoryItem from "../CategoryItem/CategoryItem";
import "./CategoryManager.css";

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
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories([...data]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!newCategory.trim()) return;

    try {
      const response = await fetch(`${base_url}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: newCategory,
          parent_id: selectedParent === "" ? null : Number(selectedParent),
        }),
      });

      if (response.ok) {
        setNewCategory("");
        setSelectedParent("");
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?"))
      return;
    try {
      const response = await fetch(`${base_url}/api/categories/${id}`, {
        credentials: "include",
        method: "DELETE",
      });
      if (response.ok) {
        await fetchCategories();
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
        await fetchCategories();
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Fonction pour générer le menu déroulant (Options)
  const renderOptions = (
    cats: CategoryTree[],
    depth = 0,
  ): React.ReactNode[] => {
    return cats.flatMap((cat) => [
      <option key={cat.id} value={cat.id}>
        {"\u00A0".repeat(depth * 2)} {cat.category}
      </option>,
      ...renderOptions(cat.children, depth + 1),
    ]);
  };

  return (
    <section className="category-manager">
      <h2>Category Manager</h2>

      <div className="category-form">
        <div className="form-group">
          <label htmlFor="parent-select">Parent Category</label>
          <select
            id="parent-select"
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className="category-select"
          >
            <option value="">-- None (Create as Root) --</option>
            {renderOptions(categories)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="category-name">Category Name</label>
          <input
            id="category-name"
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Electronics, Shirts..."
            className="category-input"
          />
        </div>

        <button type="button" onClick={handleAdd} className="cta btn-add">
          Add Category
        </button>
      </div>

      <div className="list-header">
        <h3>Existing Categories</h3>
      </div>

      <ul className="category-list">
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
