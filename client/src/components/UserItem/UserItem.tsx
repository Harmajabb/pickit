import { useState } from "react";
import type { User } from "../UserManager/UserManager";
import "./UserItem.css";

interface Props {
  user: User;
  currentAdminId: number | null;
  onDelete: (id: number) => void;
  onRoleChange: (id: number, newRole: number) => void;
  onBan: (id: number, reason: string, days: number) => void;
  onUnban: (id: number) => void;
}

function UserItem({
  user,
  currentAdminId,
  onDelete,
  onRoleChange,
  onBan,
  onUnban,
}: Props) {
  const [editMode, setEditMode] = useState<"role" | "ban" | null>(null);
  const [roleValue, setRoleValue] = useState(user.role);
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState(7);

  const isSelf = user.id === currentAdminId;

  const handleSaveRole = () => {
    onRoleChange(user.id, roleValue);
    setEditMode(null);
  };

  return (
    <li className={`user-item ${user.is_banned ? "banned-border" : ""}`}>
      <div className="user-content">
        {/* BLOC INFO */}
        <div className="user-info">
          <div className="user-name">
            <strong>
              {user.firstname} {user.lastname}
            </strong>
          </div>
          <div className="user-email">{user.email}</div>
          <div className="badges-container">
            <span className={`badge ${user.role === 1 ? "admin" : "member"}`}>
              {user.role === 1 ? "Admin" : "Member"}
            </span>
            <span
              className={`badge ${user.is_banned === 1 ? "BANNED" : "NOT BANNED"}`}
            >
              {user.is_banned === 1 ? "BANNED" : "NOT BANNED"}
            </span>
          </div>
        </div>
        <div className="user-actions-wrapper">
          {editMode === "role" && (
            <div className="edit-module">
              <div className="form-group">
                <label htmlFor="role-select">New Rôle :</label>
                <select
                  id="role-select"
                  value={roleValue}
                  onChange={(e) => setRoleValue(Number(e.target.value))}
                  disabled={isSelf}
                >
                  <option value={0}>Member</option>
                  <option value={1}>Admin</option>
                </select>
              </div>
              <div className="edit-buttons">
                <button
                  type="button"
                  aria-label="Save Button"
                  className="secondary btn-save"
                  onClick={handleSaveRole}
                >
                  Save
                </button>
                <button
                  type="button"
                  aria-label="Cancel Button"
                  className="secondary btn-cancel"
                  onClick={() => setEditMode(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {editMode === "ban" && (
            <div className="edit-module">
              <div className="ban-fields">
                <div className="form-group">
                  <label htmlFor="ban-reason">Reason :</label>
                  <input
                    id="ban-reason"
                    type="text"
                    placeholder="Reason for ban"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                </div>
                <div className="form-group days-input">
                  <label htmlFor="ban-days">Days (0 = forever):</label>
                  <input
                    id="ban-days"
                    type="number"
                    value={banDays}
                    onChange={(e) => setBanDays(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>
              <div className="edit-buttons">
                <button
                  type="button"
                  aria-label="ban bouton"
                  className="secondary uncorrect"
                  onClick={() => {
                    onBan(user.id, banReason, banDays);
                    setEditMode(null);
                  }}
                  disabled={!banReason}
                >
                  Confirm Ban
                </button>
                <button
                  type="button"
                  aria-label="Cancel bouton"
                  className="secondary btn-cancel"
                  onClick={() => setEditMode(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {editMode === null && (
            <div className="default-actions">
              <button
                type="button"
                Aria-label="role button"
                className="secondary"
                onClick={() => setEditMode("role")}
                disabled={isSelf}
              >
                Rôle
              </button>
              {user.is_banned === 0 ? (
                <button
                  type="button"
                  aria-label="Ban button"
                  className="secondary"
                  onClick={() => setEditMode("ban")}
                  disabled={isSelf}
                >
                  Banned
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Unban button"
                  className="secondary btn-unban"
                  onClick={() => onUnban(user.id)}
                >
                  Debanned
                </button>
              )}
              <button
                type="button"
                aria-label="Delete button"
                className="secondary uncorrect"
                onClick={() => onDelete(user.id)}
                disabled={isSelf}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default UserItem;
