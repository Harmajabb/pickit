import { Heart, MapPin } from "lucide-react";
import { Link } from "react-router";
import "./ItemCard.css";
interface Props {
  id: number;
  title: string;
  location: string;
  all_images?: string;
}
const BASE_URL = `${import.meta.env.VITE_API_URL}/assets/images/`;

function ItemCard({ id, title, location, all_images }: Props) {
  return (
    <Link to={`/announce/${id}`} className="item-link" tabIndex={0}>
      <article className="itemCard-section">
        <div className="itemCard-image-container" key={id}>
          <img
            key={`${id}-${all_images}`}
            src={`${BASE_URL}${all_images}`}
            alt={`${title}-${all_images}`}
          />
          <button type="button" className="like-button">
            <Heart size={16} strokeWidth={2} />
            <span>12</span>
          </button>
        </div>
        <div className="itemCard-info" key={id}>
          <h3 className="itemCard-title">{title}</h3>
          <p>
            <MapPin size={14} strokeWidth={2} />
            {location}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default ItemCard;
