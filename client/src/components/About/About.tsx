import AboutVideo from "../../assets/images/About-landing/5679346-uhd_3840_2160_25fps.mp4";
import "./About.css";
import { useRevealOnScroll } from "../../../hooks/useRevealOnScroll";

function About() {
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`about reveal ${isVisible ? "is-visible" : ""}`}
      aria-labelledby="about-title"
    >
      <div className="about-container">
        <h2 id="about-title" className="about-title">
          Share More. Buy Less.
        </h2>

        <div
          className={`about-divider ${isVisible ? "divider-visible" : ""}`}
          aria-hidden="true"
        />

        <div className="about-text-wrapper">
          <div className="about-feature-text">
            <p className="about-feature-line">
              One-click change everything. Access, share, and enjoy sports
              without the price tag.
            </p>
          </div>

          <div className="about-text-column">
            <p>
              Pickit is a peer-to-peer sports equipment lending platform. We
              start from a simple observation: sports gear is often expensive
              and only used a few times. With Pickit, everyone can lend, borrow,
              and enjoy sports more freely without unnecessary purchases. Our
              goal is to make sharing easier, build trust between users, and
              make sports more accessible to everyone.
            </p>
          </div>
        </div>

        <video
          className="about-video"
          src={AboutVideo}
          autoPlay
          muted
          loop
          playsInline
          aria-label="Video showing people sharing sports equipment"
        />
      </div>
    </section>
  );
}

export default About;
