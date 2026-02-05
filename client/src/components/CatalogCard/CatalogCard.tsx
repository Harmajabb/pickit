import { MapPin } from "lucide-react";
import { Link } from "react-router";
import type { Announce } from "../../types/Announce";
import "./CatalogCard.css";
import FavoriteBtn from "../FavoriteBtn/FavoriteBtn";

const BASE_URL = `${import.meta.env.VITE_API_URL}/assets/images/`;

interface CatalogCardProps {
  data: Announce;
}

function CatalogCard({ data }: CatalogCardProps) {
  // compute first image: server may return a comma-separated string or an array
  const getFirstImage = () => {
    const imgs = data.all_images as unknown;

    if (Array.isArray(imgs)) {
      return imgs.find(Boolean) ?? "";
    }

    if (typeof imgs === "string") {
      return (
        imgs
          .split(",")
          .map((s) => s.trim())
          .find(Boolean) ?? ""
      );
    }

    return "";
  };

  const firstImage = getFirstImage();
  return (
    <Link to={`/announce/${data.id}`} className="catalogCard-button">
      <article className="catalogCard-section">
        <div className="catalogCard-image-container">
          <img
            src={
              firstImage
                ? `${BASE_URL}${firstImage}`
                : `${BASE_URL}placeholder.png`
            }
            alt={`${data.title}-${firstImage}`}
          />
          <FavoriteBtn total_likes={data.total_likes} announce_id={data.id} />
        </div>
        <div className="catalogCard-info">
          <h3>{data.title}</h3>
          <p>
            <MapPin size={14} strokeWidth={2} />
            {data.location}
          </p>
          <p>deposit: {data.amount_deposit}€</p>
        </div>
      </article>
    </Link>
  );
}

export default CatalogCard;
