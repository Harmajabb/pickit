import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye } from "lucide-react";
import ButtonDelete from "../Btn-Delete/ButtonDelete";
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
          throw new Error("Error retrieving ad");
        }

        const data = await res.json();
        setAnnounces(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error has occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMyAnnounces();
  }, [navigate]);

  const handleViewDetails = (id: number) => {
    navigate(`/announce/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="my-announces-container">
        <p>Loading your ads...</p>
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
        <h1>My ads</h1>
        <button
          type="button"
          className="btn-create"
          onClick={() => navigate("/create-annonce")}
        >
          Create an ad
        </button>
      </div>

      {announces.length === 0 ? (
        <div className="no-announces">
          <p>You have not published any ads yet.</p>
          <button
            type="button"
            className="btn-create-empty"
            onClick={() => navigate("/create-annonce")}
          >
            Create your first ad
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
                  <div className="no-image">No image</div>
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
                    <span className="info-label">State :</span>
                    <span className="info-value">
                      {announce.state_of_product}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Location :</span>
                    <span className="info-value">{announce.location}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Availability :</span>
                    <span className="info-value">
                      {formatDate(announce.start_borrow_date)} -{" "}
                      {formatDate(announce.end_borrow_date)}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Created on :</span>
                    <span className="info-value">
                      {formatDate(announce.creation_date)}
                    </span>
                  </div>
                </div>

                <div className="announce-actions">
                  <button
                    type="button"
                    className="cta cta-with-icon"
                    onClick={() => handleViewDetails(announce.id)}
                  >
                    <Eye size={18} />
                    View / Edit
                  </button>

                  <ButtonDelete annonceId={announce.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
