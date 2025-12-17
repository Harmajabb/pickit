import { Link } from "react-router";
import heroLanding from "../../assets/images/Hero-landing/hero-landing.svg";
import "./Hero.css";

type HeroProps = {
  title?: string;
  subtitle: string;
  ctaLabel?: string;
  ctaTo?: string;
  illustrationSrc?: string;
  illustrationAlt?: string;
};

function Hero({
  title = "Sport is meant to be shared.",
  subtitle = "Lend your gear. Enjoy you sport.",
  ctaLabel = "View listing",
  ctaTo = "/listing",
  illustrationSrc,
  illustrationAlt = "People sharing sport gear illustration",
}: HeroProps) {
  return (
    <header className="hero" aria-labelledby="Pickit hero section">
      <div className="hero-container">
        <div
          className="hero-illustration-wrap"
          aria-hidden={illustrationSrc ? undefined : true}
        >
          <img
            className="hero-illustration"
            src={heroLanding}
            alt={illustrationAlt}
          />
        </div>

        <div className="hero-content">
          <h1 className="hero-title" id="Pickit hero section">
            {title}
          </h1>
          <p className="hero-subtitle">{subtitle}</p>

          <Link className="primary" to={ctaTo} aria-label="view listing page">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Hero;
