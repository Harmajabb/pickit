import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./MyAnnonces.css";

interface Annonce {
  id: number;
  title: string;
  all_images: string[];
  status?: string;
  created_at: string;
  location?: string;
  amount_deposit?: number;
}

export default function MyAnnonces() {
  const BASE_URL = `${import.meta.env.VITE_API_URL}/assets/images/`;
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyAnnonces = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/announces/my-announces`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des annonces");
        }

        const data = await response.json();
        setAnnonces(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyAnnonces();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Non défini";
    const labels: { [key: string]: string } = {
      available: "Disponible",
      rented: "Louée",
      draft: "Brouillon",
      archived: "Archivée",
    };
    return labels[status] || status;
  };

  const handleAnnonceClick = (id: number) => {
    navigate(`/announces/${id}`);
  };

  if (loading) {
    return (
      <div className="my-annonces-container">
        <div className="loading">Chargement de vos annonces...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-annonces-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-annonces-container">
      <div className="my-annonces-header">
        <h1>Mes annonces</h1>
        <button
          type="button"
          className="btn-create"
          onClick={() => navigate("/create-annonce")}
        >
          + Créer une annonce
        </button>
      </div>

      {annonces.length === 0 ? (
        <div className="empty-state">
          <p>Vous n'avez pas encore publié d'annonces.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/create-annonce")}
          >
            Créer ma première annonce
          </button>
        </div>
      ) : (
        <div className="annonces-grid">
          {annonces.map((annonce) => (
            <button
              key={annonce.id}
              type="button"
              className="annonce-card"
              onClick={() => handleAnnonceClick(annonce.id)}
            >
              <div className="annonce-image">
                <img
                  src={
                    BASE_URL + (annonce.all_images?.[0] || "placeholder.jpg")
                  }
                  alt={annonce.title}
                />
                {annonce.status && (
                  <span className={`status-badge status-${annonce.status}`}>
                    {getStatusLabel(annonce.status)}
                  </span>
                )}
              </div>

              <div className="annonce-content">
                <h3 className="annonce-title">{annonce.title}</h3>

                <div className="annonce-meta">
                  {annonce.location && (
                    <span className="annonce-location">
                      📍 {annonce.location}
                    </span>
                  )}
                  <span className="annonce-date">
                    Publié le {formatDate(annonce.created_at)}
                  </span>
                </div>

                {annonce.amount_deposit !== undefined && (
                  <div className="annonce-deposit">
                    <span className="deposit-label">Caution:</span>
                    <span className="deposit-value">
                      {annonce.amount_deposit}€
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
