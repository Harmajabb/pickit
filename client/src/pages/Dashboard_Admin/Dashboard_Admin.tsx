import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard_Admin.css";
import {
  ChartBarStacked,
  FlagTriangleRight,
  User,
  UserCog,
} from "lucide-react";
import { useRevealOnScroll } from "../../../hooks/useRevealOnScroll";
import type { Stats } from "./TS-Dashboard_Admin";

const Dashboard_Admin = () => {
  const { ref: headerRef, isVisible: headerVisible } =
    useRevealOnScroll<HTMLElement>();
  const { ref: statsRef, isVisible: statsVisible } =
    useRevealOnScroll<HTMLDivElement>();
  const { ref: controlsRef, isVisible: controlsVisible } =
    useRevealOnScroll<HTMLDivElement>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (user?.role === 1) {
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error("Erreur stats:", err));
    }
  }, [user]);

  if (!user || user.role !== 1) {
    return <div>Access Denied.</div>;
  }

  return (
    <div className="dashboard-admin">
      <header
        ref={headerRef}
        className={`dashboard-admin-header reveal ${headerVisible ? "is-visible" : ""}`}
      >
        <h1>Admin Dashboard</h1>
        <p>
          Welcome back, <strong>{user?.firstname}</strong>!
        </p>
      </header>

      <section className="admin-cockpit">
        <div
          ref={statsRef}
          className={`stats-items reveal-stagger ${statsVisible ? "is-visible" : ""}`}
        >
          <div className="stats-item">
            <h5>Active Users</h5>
            <span className="stat-value">{stats?.userCount ?? 0}</span>
          </div>

          <div className="stats-item">
            <h5>Reports Generated</h5>
            <span className="stat-value">{stats?.reportCount ?? 0}</span>
          </div>

          <div className="stats-item">
            <h5>Announcements</h5>
            <span className="stat-value">{stats?.announcementCount ?? 0}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="title-controls">Admin Controls</h2>
        <div
          ref={controlsRef}
          className={`list-btn reveal-stagger ${controlsVisible ? "is-visible" : ""}`}
        >
          <button
            onClick={() => navigate("/profile/me")}
            className="secondary btnusers"
            type="button"
          >
            <UserCog size={32} strokeWidth={2} />
            Manage My Profile
          </button>
          <button
            onClick={() => navigate("/ad-dashboard/users")}
            className="secondary btnusers"
            type="button"
          >
            <User size={32} strokeWidth={2} />
            Manage Users
          </button>
          <button className="secondary btnusers" type="button">
            <FlagTriangleRight size={32} strokeWidth={2} />
            Manage Reports
          </button>
          <button
            onClick={() => navigate("/ad-dashboard/categories")}
            className="secondary btnusers"
            type="button"
          >
            <ChartBarStacked size={32} strokeWidth={2} />
            Manage Category
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard_Admin;
