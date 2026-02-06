import { Link } from "react-router";
// import heroLanding from "../../assets/images/Hero-landing/hero-landing.svg";
import heroVideo from "../../assets/images/Hero-landing/7166286-uhd_3840_2160_24fps.mp4";
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
    illustrationSrc: heroVideo,
    illustrationAlt: "Women enjoying shared sports equipment",
  };
  return (
    <header className="hero">
      <div className="hero-container">
        <div className="hero-content hero-anim hero-anim--content">
          <h1 className="hero-title" id="hero-title">
            {heroContent.title}
          </h1>
          <p className="hero-subtitle">{heroContent.subtitle}</p>

          <Link
            className="cta hero-cta hero-anim hero-anim--cta"
            to={heroContent.ctaTo}
            aria-label={`${heroContent.ctaLabel} - Discover our program`}
            tabIndex={0}
          >
            {heroContent.ctaLabel}
          </Link>
        </div>

        <div
          className="hero-illustration-wrap hero-anim hero-anim--image"
          aria-hidden={heroContent.illustrationSrc ? undefined : true}
        >
          <video
            className="hero-illustration"
            src={heroContent.illustrationSrc}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </div>
    </header>
  );
}

export default Hero;
