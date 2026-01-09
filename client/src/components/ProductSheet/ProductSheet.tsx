import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import "./ProductSheet.css";

export default function ProductSheet() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "https://contents.mediadecathlon.com/p2691312/k$c73bfb994a8c51cb15cb38549397dec6/picture.jpg",
    "https://contents.mediadecathlon.com/p2691311/k$5777bd5bf52208485450b7c17be286d0/picture.jpg",
    "https://contents.mediadecathlon.com/p2944527/k$4e49461a8bf8128842fd16143fcdb295/picture.jpg",
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="product-sheet">
      <div className="product-container">
        <div className="product-content">
          <div className="image-section">
            <div className="image-wrapper">
              <img
                src={images[currentImage]}
                alt="Ski poles"
                className="product-image"
              />

              <button onClick={prevImage} className="nav-arrow nav-arrow-left">
                <ChevronLeft className="arrow-icon" />
              </button>
              <button onClick={nextImage} className="nav-arrow nav-arrow-right">
                <ChevronRight className="arrow-icon" />
              </button>
            </div>
          </div>

          <div className="info-section">
            <h1 className="product-title">SKI POLES 120CM</h1>

            <div className="action-buttons">
              <button className="btn btn-delete">Delete</button>
              <button className="btn btn-modify">Modify</button>
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

            <button className="btn btn-contact">Contact the borrower</button>
          </div>
        </div>
        <div className="tiny-img">
          <img
            src={images[currentImage]}
            alt="Ski poles"
            className="product-image"
          />
                    <img
            src={images[currentImage]}
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
