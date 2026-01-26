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
  return (
    <Link
      to={`/announce/${data.id}`}
      // state={{ announce: data }}
      className="catalogCard-button"
    >
      <article className="catalogCard-section">
        <div className="catalogCard-image-container" key={data.id}>
          <img
            key={`${data.id}-${data.all_images}`}
            src={`${BASE_URL}${data.all_images?.[0]}`}
            alt={`${data.title}-${data.all_images}`}
          />
          <FavoriteBtn total_likes={data.total_likes} announce_id={data.id} />
        </div>
        <div className="catalogCard-info" key={data.id}>
          <h3>{data.title}</h3>
          <p>
            <MapPin size={14} strokeWidth={2} />
            {data.location}
          </p>
          <p>{data.amount_deposit}€</p>
        </div>
      </article>
    </Link>
  );
}

export default CatalogCard;
