import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Trash2, Eye } from "lucide-react";
import "./MyAnnouncesList.css";

interface MyAnnounce {
  id: number;
  title: string;
  description: string;
  location: string;
  start_borrow_date: string;
  end_borrow_date: string;
  creation_date: string;
  state_of_product: string;
  image_url: string | null;
}

export default function MyAnnouncesList() {
  const BASE_URL = `${import.meta.env.VITE_API_URL}/assets/images/`;
  const navigate = useNavigate();
  const [announces, setAnnounces] = useState<MyAnnounce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyAnnounces = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/announces/my-announces`,
          {
            credentials: "include",
          },
        );

        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login");
            return;
          }
          throw new Error("Erreur lors de la récupération des annonces");
        }

        const data = await res.json();
        setAnnounces(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyAnnounces();
  }, [navigate]);

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announces/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setAnnounces(announces.filter((announce) => announce.id !== id));
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de l'annonce",
      );
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/announce/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="my-announces-container">
        <p>Chargement de vos annonces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-announces-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="my-announces-container">
      <div className="my-announces-header">
        <h1>Mes Annonces</h1>
        <button
          type="button"
          className="btn-create"
          onClick={() => navigate("/create-annonce")}
        >
          Créer une annonce
        </button>
      </div>

      {announces.length === 0 ? (
        <div className="no-announces">
          <p>Vous n'avez pas encore d'annonces publiées.</p>
          <button
            type="button"
            className="btn-create-empty"
            onClick={() => navigate("/create-annonce")}
          >
            Créer ma première annonce
          </button>
        </div>
      ) : (
        <div className="announces-grid">
          {announces.map((announce) => (
            <div key={announce.id} className="announce-card">
              <div className="announce-image">
                {announce.image_url ? (
                  <img
                    src={BASE_URL + announce.image_url}
                    alt={announce.title}
                  />
                ) : (
                  <div className="no-image">Aucune image</div>
                )}
              </div>

              <div className="announce-content">
                <h3 className="announce-title">{announce.title}</h3>

                <p className="announce-description">
                  {announce.description.length > 100
                    ? `${announce.description.substring(0, 100)}...`
                    : announce.description}
                </p>

                <div className="announce-info">
                  <div className="info-row">
                    <span className="info-label">État :</span>
                    <span className="info-value">
                      {announce.state_of_product}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Lieu :</span>
                    <span className="info-value">{announce.location}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Disponibilité :</span>
                    <span className="info-value">
                      {formatDate(announce.start_borrow_date)} -{" "}
                      {formatDate(announce.end_borrow_date)}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Créée le :</span>
                    <span className="info-value">
                      {formatDate(announce.creation_date)}
                    </span>
                  </div>
                </div>

                <div className="announce-actions">
                  <button
                    type="button"
                    className="btn-view"
                    onClick={() => handleViewDetails(announce.id)}
                  >
                    <Eye size={18} />
                    Voir / Modifier
                  </button>

                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDelete(announce.id, announce.title)}
                  >
                    <Trash2 size={18} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
