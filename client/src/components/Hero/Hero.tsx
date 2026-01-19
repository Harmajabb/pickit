import { Link } from "react-router";
import heroLanding from "../../assets/images/Hero-landing/hero-landing.svg";
import "./Hero.css";

type HeroContentTypes = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTo: string;
  illustrationSrc: string;
  illustrationAlt: string;
};

function Hero() {
  const heroContent: HeroContentTypes = {
    title: "Sport is meant to be shared.",
    subtitle: "Lend your gear. Enjoy you sport.",
    ctaLabel: "View listing",
    ctaTo: "/catalog",
    illustrationSrc: "People sharing sport gear illustration",
    illustrationAlt: "People sharing sport gear illustration",
  };
  return (
    <header className="hero">
      <div className="hero-container">
        <div
          className="hero-illustration-wrap hero-anim hero-anim--image"
          aria-hidden={heroContent.illustrationSrc ? undefined : true}
        >
          <img
            className="hero-illustration"
            src={heroLanding}
            alt={heroContent.illustrationAlt}
          />
        </div>

        <div className="hero-content hero-anim hero-anim--content">
          <h1 className="hero-title" id="Pickit hero section">
            {heroContent.title}
          </h1>
          <p className="hero-subtitle">{heroContent.subtitle}</p>

          <Link
            className="primary hero-anim hero-anim--cta"
            to={heroContent.ctaTo}
            aria-label="view listing page"
          >
            {heroContent.ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Hero;
