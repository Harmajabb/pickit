import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import CatalogCard from "../../components/CatalogCard/CatalogCard";
import { AuthContext } from "../../context/AuthContext";
import type { Announce } from "../../types/Announce";
import "./FavoritesPage.css";

const API_URL = import.meta.env.VITE_API_URL;

type FavoritesPageProps = { mode: "me" } | { mode: "member"; userId?: string };

function FavoritesPage(props: FavoritesPageProps) {
  const { id: paramUserId } = useParams();
  const { user: authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Announce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId =
    props.mode === "member" ? (props.userId ?? paramUserId) : undefined;

  console.log("render FavoritesPage", {
    mode: props.mode,
    userId,
    isLoading,
    error,
    favoritesCount: favorites.length,
  });

  useEffect(() => {
    console.log("useEffect START", {
      mode: props.mode,
      userId,
      authUser: authUser?.id,
    });

    if (props.mode === "member" && !userId) {
      console.log("No userId for member mode");
      setIsLoading(false);
      setError("User ID is missing");
      return;
    }

    if (props.mode === "me" && !authUser) {
      console.log("Not authenticated, redirecting");
      navigate("/login");
      return;
    }

    const endpoint =
      props.mode === "me"
        ? `${API_URL}/api/favorites/me`
        : `${API_URL}/api/favorites/${userId}`;

    console.log("📡 Fetching from:", endpoint);

    const fetchFavorites = async () => {
      try {
        const response = await fetch(endpoint, {
          credentials: "include",
        });

        console.log("Response:", {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Error ${response.status}: Failed to load favorites`,
          );
        }

        const data = await response.json();
        console.log(" Data received:", {
          type: typeof data,
          isArray: Array.isArray(data),
          length: data?.length,
          data: data,
        });
        setFavorites(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [props.mode, userId, authUser, navigate]);

  if (isLoading) {
    console.log(" Displaying loading state");
    return (
      <section className="favorites-page" aria-busy="true">
        <div aria-live="polite" className="favorites-loading">
          <p>Loading your favorites...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="favorites-page">
        <div role="alert" className="favorites-error">
          <p className="cta uncorrect">{error}</p>
        </div>
      </section>
    );
  }

  const title = props.mode === "me" ? "My Favorites" : "Member's Favorites";
  const emptyMessage =
    props.mode === "me"
      ? "You haven't added any favorites yet."
      : "This member hasn't added any favorites yet.";
  console.log(" Rendering final content", {
    title,
    favoritesCount: favorites.length,
    isEmpty: favorites.length === 0,
  });

  return (
    <section className="favorites-page" aria-labelledby="favorites-title">
      <header className="favorites-header">
        <h1 id="favorites-title">{title}</h1>
        {favorites.length > 0 && (
          <p>
            {favorites.length} item{favorites.length > 1 ? "s" : ""}
          </p>
        )}
      </header>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <p>{emptyMessage}</p>
          {props.mode === "me" && (
            <button
              type="button"
              onClick={() => navigate("/catalog")}
              className="cta primary"
            >
              Browse items
            </button>
          )}
        </div>
      ) : (
        <section aria-labelledby="favorites-list-title">
          <h2 id="favorites-list-title" className="sr-only">
            Favorites list
          </h2>
          <ul className="favorites-grid">
            {favorites.map((favorite) => (
              <li key={favorite.id}>
                <CatalogCard data={favorite} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}

export default FavoritesPage;
