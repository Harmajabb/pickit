import { useState } from "react";
import type { CategoryTree } from "../CategoryManager/CategoryManager";
import "./CategoryItem.css";

interface Props {
  category: CategoryTree;
  onDelete: (id: number) => void;
  onEdit: (id: number, newTitle: string) => void;
}

function CategoryItem({ category, onDelete, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const [editValue, setEditValue] = useState(category.category);

  const handleSave = () => {
    if (editValue.trim() !== "") {
      onEdit(category.id, editValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(category.category);
    setIsEditing(false);
  };

  return (
    <ul className="category-item">
      <div className="category-content">
        {isEditing ? (
          <div className="edit-zone">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            <button
              type="button"
              aria-label="Save button"
              className="secondary btn-save"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              aria-label="Cancel button"
              className="secondary uncorrect btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span>{category.category}</span>
            <div className="actions">
              <button
                type="button"
                aria-label="Delete Category"
                className="secondary uncorrect btn-delete"
                onClick={() => onDelete(category.id)}
              >
                Delete
              </button>
              <button
                type="button"
                aria-label="Edit Category"
                className="secondary btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Update
              </button>
            </div>
          </>
        )}
      </div>

      {category.children && category.children.length > 0 && (
        <li className="subcategory-list">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </li>
      )}
    </ul>
  );
}

export default CategoryItem;
