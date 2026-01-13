import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import "./ProductSheet.css";
import EditAnnonce from "../EditAnnonce/EditAnnonce";

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
}

export default function ProductSheet() {
  const { announceId } = useParams();
  const [announce, setAnnounce] = useState<Announce | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const DateStartshort =
    announce?.start_borrow_date.toLocaleDateString("fr-FR");
  const DateEndShort = announce?.end_borrow_date.toLocaleDateString("fr-FR");

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

  return (
    <div className="product-sheet">
      <div className="product-container">
        <div className="product-content">
          <div className="image-section">
            <div className="image-wrapper">
              <img
                src={announce.all_images[currentImage]}
                alt="Ski poles"
                className="product-image"
              />

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
            </div>
          </div>

          <div className="info-section">
            <h1 className="product-title">{announce.title}</h1>

            <div className="action-buttons">
              <button type="button">
                {/* <ButtonDelete annonceId={announce.id} /> */}
              </button>
              <button type="button">
                <EditAnnonce annonceId={announce.id} />
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
                <p className="info-value">{announce.name}</p>
              </div>

              <div className="info-field">
                <p className="info-label">Favourites</p>
                <div className="favourites">
                  <span className="info-value">12</span>
                  <Heart className="heart-icon" />
                </div>
              </div>
            </div>

            <button type="button" className="btn btn-contact">
              Contact the borrower
            </button>
          </div>
        </div>
        <div className="tiny-img">
          <img
            src={announce.all_images[currentImage]}
            alt="Files"
            className="product-image"
          />
          <img
            src={announce.all_images[currentImage]}
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
