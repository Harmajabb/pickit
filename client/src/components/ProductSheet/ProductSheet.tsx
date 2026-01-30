import { AuthContext } from "../../context/AuthContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "react-router";
import { useContext, useEffect, useState } from "react";
import type { AnnounceDetail } from "../../types/Announce";
import ButtonDelete from "../Btn-Delete/ButtonDelete";
import EditAnnonce from "../EditAnnonce/EditAnnonce";
import FavoriteBtn from "../FavoriteBtn/FavoriteBtn";
import ContactLenderButton from "../ContactLenderButton/ContactLenderButton";
import "./ProductSheet.css";

interface Announce {
  id: number;
  title: string;
  description: string;
  location: string;
  state: string;
  owner_id: number;
  all_images: string[];
  favourites?: number;
  start_borrow_date: Date;
  end_borrow_date: Date;
  amount_deposit: number;
  state_of_product: string;
  name: string;
  total_likes: number;
  lastname: string;
  firstname: string;
  zipcode: number;
  categorie_id: number;
}

export default function ProductSheet() {
  const { user } = useContext(AuthContext);
  const BASE_URL = `${import.meta.env.VITE_API_URL}/assets/images/`;
  const { announceId } = useParams();

  const [announce, setAnnounce] = useState<Announce | null>(null);
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

  const isOwner = user?.id && Number(user.id) === Number(announce.owner_id);
  const isAdmin = user?.role === 1;
  const showActionButtons = isOwner || isAdmin;

  const DateStartshort = announce.start_borrow_date.toLocaleDateString("fr-FR");
  const DateEndShort = announce.end_borrow_date.toLocaleDateString("fr-FR");

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % announce.all_images.length);
  };

  const prevImage = () => {
    setCurrentImage(
      (prev) =>
        (prev - 1 + announce.all_images.length) % announce.all_images.length,
    );
  };

  const handleSave = (updatedAnnounce: AnnounceDetail) => {
    setAnnounce(updatedAnnounce);
    setIsEditing(false);
  };

  const handleLoanRequestSuccess = () => {
    console.log("Demande de prêt envoyée avec succès !");
  };

  return (
    <div className="product-sheet">
      <div className="product-container">
        <div className="product-content">
          <div className="image-section">
            <div className="image-wrapper">
              <img
                src={BASE_URL + announce.all_images[currentImage]}
                alt={announce.title}
                className="product-image"
              />

              {announce.all_images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="nav-arrow nav-arrow-left"
                  >
                    <ChevronLeft className="arrow-icon" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="nav-arrow nav-arrow-right"
                  >
                    <ChevronRight className="arrow-icon" />
                  </button>
                </>
              )}
            </div>
            <div className="tiny-img">
              {announce.all_images.map((image, index) => {
                const isSelected = currentImage === index;
                return (
                  <button
                    key={image}
                    type="button"
                    className={`thumbnail-button ${isSelected ? "active" : ""}`}
                    onClick={() => setCurrentImage(index)}
                    aria-label={`Afficher l'image ${index + 1}`}
                    aria-pressed={isSelected}
                  >
                    <img
                      src={BASE_URL + image}
                      alt={`Miniature ${index + 1}`}
                      className="product-image"
                    />
                  </button>
                );
              })}
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

                {showActionButtons && (
                  <div className="action-buttons">
                    <ButtonDelete annonceId={Number(announceId)} />
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                <div className="info-fields">
                  <div className="info-field">
                    <p className="info-label">Location</p>
                    <p className="info-value">
                      {announce.zipcode} {announce.location}
                    </p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Caution</p>
                    <p className="info-value">{announce.amount_deposit}€</p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Disponibility</p>
                    <p className="info-value">
                      {DateStartshort} - {DateEndShort}
                    </p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Global state</p>
                    <p className="info-value">{announce.state_of_product}</p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Posted by</p>
                    <p className="info-value">
                      {announce.firstname} {announce.lastname}
                    </p>
                  </div>

                  <div className="info-field">
                    <p className="info-label">Favoris</p>
                    <FavoriteBtn
                      total_likes={announce.total_likes}
                      announce_id={announce.id}
                    />
                  </div>
                </div>

                {/* Bouton de demande de prêt */}
                <ContactLenderButton
                  announceId={announce.id}
                  ownerId={announce.owner_id}
                  currentUserId={user?.id || null}
                  isAuthenticated={!!user}
                  onSuccess={handleLoanRequestSuccess}
                  availableFrom={announce.start_borrow_date}
                  availableUntil={announce.end_borrow_date}
                />
              </>
            )}
          </div>
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
