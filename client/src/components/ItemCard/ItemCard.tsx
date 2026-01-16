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
    <article className="itemCard-section">
      <div className="itemCard-image-container" key={id}>
        <img
          key={`${id}-${all_images}`}
          src={`${BASE_URL}${all_images}`}
          alt={`${title}-${all_images}`}
        />
        <button className="like-button">
          🤍 12
        </button>
      </div>
      <div className="itemCard-info" key={id}>
        <h3>{title}</h3>
        <p>
          <span>📍</span>
          {location}
        </p>
      </div>
    </article>
  );
}

export default ItemCard;
