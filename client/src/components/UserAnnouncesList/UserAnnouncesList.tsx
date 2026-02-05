import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useRevealOnScroll } from "../../../hooks/useRevealOnScroll";
import type { Announce } from "../../types/Announce";
import type { UserPublic } from "../../types/User";
import CatalogCard from "../CatalogCard/CatalogCard";
import "./UserAnnouncesList.css";

interface ProfileResponse {
  user: UserPublic;
  items: Announce[];
  favorites: Announce[];
}

function UserAnnouncesList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { ref: headerRef, isVisible: headerVisible } =
    useRevealOnScroll<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVisible } =
    useRevealOnScroll<HTMLUListElement>();

  const [announces, setAnnounces] = useState<Announce[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAnnounces = async () => {
      if (!id) {
        setError("User ID not provided");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/profile/${id}`,
          {
            credentials: "include",
          },
        );

        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login");
            return;
          }
          if (res.status === 404) {
            setError("User not found");
            setLoading(false);
            return;
          }
          throw new Error("Error retrieving user announcements");
        }

        const data: ProfileResponse = await res.json();
        setAnnounces(data.items);
        setUserName(`${data.user.firstname} ${data.user.lastname}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error has occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnnounces();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="user-announces-container">
        <p>Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-announces-container">
        <p className="primary uncorrect">{error}</p>
      </div>
    );
  }

  return (
    <div className="user-announces-container">
      <div
        ref={headerRef}
        className={`user-announces-header reveal ${headerVisible ? "is-visible" : ""}`}
      >
        <h1>
          {userName ? `${userName}'s announcements` : "User announcements"}
        </h1>
        <Link to={`/profile/${id}`} className="primary" tabIndex={0}>
          Back to profile
        </Link>
      </div>

      {announces.length === 0 ? (
        <div className="user-no-announces">
          <p>This user has not published any announcements yet.</p>
        </div>
      ) : (
        <ul
          ref={gridRef}
          className={`user-announces-grid reveal-stagger ${gridVisible ? "is-visible" : ""}`}
        >
          {announces.map((announce) => (
            <li key={announce.id}>
              <CatalogCard data={announce} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserAnnouncesList;
