import { useState } from "react";
import type { CategoryTree } from "../CategoryManager/CategoryManager";

interface CategoryItemProps {
  category: CategoryTree;
  onDelete: (id: number) => void;
  onEdit: (id: number, newTitle: string) => void;
}

function CategoryItem({ category, onDelete, onEdit }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(category.category);

  const saveEdit = () => {
    onEdit(category.id, editTitle);
    setIsEditing(false);
  };

  return (
    <li>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {isEditing ? (
          <>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <button type="button" onClick={saveEdit}>
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <span>{category.category}</span>
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          </>
        )}
      </div>

      {category.children && category.children.length > 0 && (
        <ul>
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default CategoryItem;
