import { Link } from "react-router";
import type { Announces } from "../ItemHighlight/Ts-ItemHighlight.ts";
import "./CatalogCard.css";
const BASE_URL = `${import.meta.env.VITE_API_URL}/assets/images/`;

interface CatalogCardProps {
  data: Announces;
}

function CatalogCard({ data }: CatalogCardProps) {
  return (
    <article className="catalogCard-section">
      <div className="catalogCard-image-container" key={data.id}>
        <img
          key={`${data.id}-${data.all_images}`}
          src={`${BASE_URL}${data.all_images?.[0]}`}
          alt={`${data.title}-${data.all_images}`}
        />
        <button type="button" className="like-button">
          🤍 12
        </button>
      </div>
      <div className="catalogCard-info" key={data.id}>
        <h3>{data.title}</h3>
        <p>
          <span>📍</span>
          {data.location}
        </p>
        <p>{data.amount_deposit}€</p>
        <Link
          to={`/announce/${data.id}`}
          state={{ announce: data }}
          className="catalogCard-button"
        >
          Voir l'annonce
        </Link>
      </div>
    </article>
  );
}

export default CatalogCard;
