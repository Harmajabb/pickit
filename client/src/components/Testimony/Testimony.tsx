import "./Testimony.css";
import { useRevealOnScroll } from "../../../hooks/useRevealOnScroll";

// Data of the testimonies outside of the function

const REVIEWS = [
  {
    id: 1,
    name: "Matt Cannon",
    role: "Head of Marketing",
    text: "Super service ! J'ai pu louer une planche de surf en deux clics pour mon week-end.",
  },
  {
    id: 2,
    name: "Julie Martin",
    role: "Designer",
    text: "Une solution écologique et économique. Le matériel est toujours de super qualité !",
  },
  {
    id: 3,
    name: "Thomas Bernard",
    role: "Particulier",
    text: "Très rassurant de pouvoir louer un vélo pour le weekend à ses voisins en toute confiance.",
  },
];

const Testimony = () => {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`testimonial-container reveal ${isVisible ? "is-visible" : ""}`}
    >
      <div className="testimonial-wrapper">
        <h2 className="section-title">Testimony</h2>

        <div className="reviews-grid">
          {REVIEWS.map((review) => (
            <div key={review.id} className="main-card">
              <div className="section-header">
                <div className="frame-avatar">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4285f4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    role="img"
                    aria-labelledby={`userIcon-${review.id}`}
                  >
                    <title id={`userIcon-${review.id}`}>User icon</title>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="user-name">{review.name}</p>
                  <p className="job-title">{review.role}</p>
                </div>
              </div>

              <p className="review-text">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimony;
