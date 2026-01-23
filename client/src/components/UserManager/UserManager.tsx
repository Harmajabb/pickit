import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import UserItem from "../UserItem/UserItem";
import "./UserManager.css";

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: number;
  is_banned: number;
}

function UserManager() {
  const base_url = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState<User[]>([]);
  const currentAdminId = useContext(AuthContext).user?.id || null;

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${base_url}/api/users`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      console.log("Données reçues de l'API :", data);
      setUsers(data.users);
    } catch (error) {
      console.error("Error:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id: number, newRole: number) => {
    try {
      const response = await fetch(
        `${base_url}/api/users/${id}/change-user-role`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: id, newRole }),
        },
      );
      if (response.ok) await fetchUsers();
      else alert("Error updating role");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBan = async (id: number, reason: string, days: number) => {
    try {
      const response = await fetch(`${base_url}/api/users/${id}/ban-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason, days }),
      });
      if (response.ok) await fetchUsers();
      else {
        const errorData = await response.json();
        alert(errorData.message || "Error banning user");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUnban = async (id: number) => {
    try {
      const response = await fetch(`${base_url}/api/users/${id}/unban-user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (response.ok) await fetchUsers();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this user?")
    )
      return;
    try {
      const response = await fetch(`${base_url}/api/users/${id}/delete-user`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) await fetchUsers();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <section className="user-manager">
      <h2>User Management</h2>
      <div className="user-list-container">
        <ul className="user-list">
          {users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              currentAdminId={currentAdminId}
              onDelete={handleDelete}
              onRoleChange={handleRoleChange}
              onBan={handleBan}
              onUnban={handleUnban}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default UserManager;
