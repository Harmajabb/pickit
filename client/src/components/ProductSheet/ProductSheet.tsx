import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import "./ProductSheet.css";
import type { AnnounceDetail } from "../../types/Announce";
import EditAnnonce from "../EditAnnonce/EditAnnonce";
import FavoriteBtn from "../FavoriteBtn/FavoriteBtn";

export default function ProductSheet() {
  const BASE_URL = `${import.meta.env.VITE_API_URL}/assets/images/`;
  const { announceId } = useParams();
  const [announce, setAnnounce] = useState<AnnounceDetail | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/announces/${announceId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch announce");
        return res.json();
      })
      .then((data) => {
        const formattedData = {
          ...data,
          start_borrow_date: new Date(data.start_borrow_date),
          end_borrow_date: new Date(data.end_borrow_date),
        };
        setAnnounce(formattedData);
      })
      .catch((err) => console.error(err));
  }, [announceId]);

  if (!announce) return <p>Loading...</p>;

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % announce.all_images.length);
  };

  const prevImage = () => {
    setCurrentImage(
      (prev) =>
        (prev - 1 + announce.all_images.length) % announce.all_images.length,
    );
  };

  const DateStartshort = announce.start_borrow_date.toLocaleDateString("fr-FR");
  const DateEndShort = announce.end_borrow_date.toLocaleDateString("fr-FR");

  const handleSave = (updatedAnnounce: AnnounceDetail) => {
    setAnnounce(updatedAnnounce);
    setIsEditing(false);
  };

  return (
    <div className="product-sheet">
      <div className="product-container">
        <div className="product-content">
          <div className="image-section">
            <div className="image-wrapper">
              <img
                src={BASE_URL + announce.all_images[currentImage]}
                alt="Ski poles"
                className="product-image"
              />
              <button
                type="button"
                onClick={prevImage}
                className="nav-arrow nav-arrow-left"
                aria-label="Image précédente"
              >
                <ChevronLeft className="arrow-icon" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="nav-arrow nav-arrow-right"
                aria-label="Image suivante"
              >
                <ChevronRight className="arrow-icon" />
              </button>
            </div>

            <div className="tiny-img">
              {announce.all_images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setCurrentImage(idx)}
                  className="tiny-img-button"
                >
                  <img
                    src={img}
                    alt={`Miniature ${idx + 1}`}
                    className={`product-image ${currentImage === idx ? "active" : ""}`}
                    style={{ opacity: currentImage === idx ? 1 : 0.6 }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="info-section">
            {isEditing ? (
              <EditAnnonce
                announce={announce}
                onCancel={() => setIsEditing(false)}
                onSave={handleSave}
              />
            ) : (
              <>
                <h1 className="product-title">{announce.title}</h1>

                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn btn-modify"
                    onClick={() => setIsEditing(true)}
                  >
                    Éditer
                  </button>
                </div>

                <div className="info-fields">
                  <div className="info-field">
                    <p className="info-label">Location</p>
                    <p className="info-value">{announce.location}</p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Caution</p>
                    <p className="info-value">{announce.amount_deposit}€</p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Disponibilité</p>
                    <p className="info-value">
                      {DateStartshort} - {DateEndShort}
                    </p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">État global</p>
                    <p className="info-value">{announce.state_of_product}</p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Publié par</p>
                    <p className="info-value">{announce.name}</p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Favoris</p>
                    <FavoriteBtn
                      total_likes={announce.total_likes}
                      announce_id={announce.id}
                    />
                  </div>
                </div>

                <button type="button" className="btn btn-contact">
                  Contacter l'emprunteur
                </button>
              </>
            )}
          </div>
        </div>
        <div className="tiny-img">
          <img
            src={BASE_URL + announce.all_images[currentImage]}
            alt="Files"
            className="product-image"
          />
          <img
            src={BASE_URL + announce.all_images[currentImage]}
            alt="Files"
            className="product-image"
          />
        </div>
        <div className="description">
          <p className={announce.description.length > 300 ? "long-text" : ""}>
            {announce.description}
          </p>
        </div>
      </div>
    </div>
  );
}
