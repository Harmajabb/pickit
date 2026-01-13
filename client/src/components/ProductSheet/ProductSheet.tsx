import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
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
}

export default function ProductSheet() {
  const { announceId } = useParams();
  const [announce, setAnnounce] = useState<Announce | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/announces/${announceId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch announce");
        return res.json();
      })
      .then((data) => setAnnounce(data))
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
      {console.log(announce)}
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
            <h1 className="product-title">SKI POLES 120CM</h1>

            <div className="action-buttons">
              <button type="button" className="btn btn-delete">
                Delete
              </button>
              <button type="button" className="btn btn-modify">
                Modify
              </button>
            </div>

            <div className="info-fields">
              <div className="info-field">
                <p className="info-label">Location</p>
                <p className="info-value">Marseille 13th</p>
              </div>

              <div className="info-field">
                <p className="info-label">Year</p>
                <p className="info-value">2008</p>
              </div>

              <div className="info-field">
                <p className="info-label">Global state</p>
                <p className="info-value">Good</p>
              </div>

              <div className="info-field">
                <p className="info-label">Posted by</p>
                <p className="info-value">Jean_mich51</p>
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
            alt="Ski poles"
            className="product-image"
          />
          <img
            src={announce.all_images[currentImage]}
            alt="Ski poles"
            className="product-image"
          />
        </div>
        <div className="description">
          <p className="description-paragraph">
            <strong>
              Lightweight and sturdy ski poles, ideal for recreational or
              occasional skiing.
            </strong>
          </p>
          <p className="description-paragraph">
            Suitable for skiers around 1.55 m to 1.65 m tall, these poles
            provide good balance and comfort on the slopes.
          </p>
          <p className="description-paragraph">
            Well maintained and ready to use.
          </p>
          <p className="description-paragraph">
            Perfect for a weekend, a short trip, or testing before buying your
            own equipment.
          </p>
        </div>
      </div>
    </div>
  );
}
