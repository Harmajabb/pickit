import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard_Admin.css";
import type { Stats } from "./TS-Dashboard_Admin";

const Dashboard_Admin = () => {
  const { user } = useContext(AuthContext);
  console.log("État de l'utilisateur :", user);
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    if (user?.role === 1) {
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        credentials: "include",
      }) // Ajustez l'URL selon votre config
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error("Erreur stats:", err));
    }
  }, [user]);
  if (!user || user.role !== 1) {
    return (
      <div>Access Denied. You do not have permission to view this page.</div>
    );
  }
  return (
    <div className="dashboard-admin">
      <div className="dashboard-admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.firstname}!</p>
      </div>
      <section className="admin-cockpit">
        <h2>Admin Cockpit</h2>
        <div>
          <p>Number of users currently connected: {stats?.userCount || 0}</p>
          <p>Number of reports generated: {stats?.reportCount || 0}</p>
          <p>Number of announcements: {stats?.announcementCount || 0}</p>
        </div>
      </section>
      <section>
        <h2>Admin Controls</h2>
        <div>
          <button type="button">Manage Users</button>
          <button type="button">Review Reports</button>
          <button type="button">Moderate Announcements</button>
          <button type="button">Moderate Review</button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard_Admin;
