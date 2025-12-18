import "./About.css";
import AboutLanding from "../../assets/images/About-landing/about-landing.svg";

function About() {
  return (
    <section className="about" aria-labelledby="about-title">
      <div className="about-container">
        <h2 id="about-title" className="about-title">
          About Pickit
        </h2>

        <div className="about-divider" aria-hidden="true" />

        <div className="about-text">
          <p>
            Pickit is a peer-to-peer sports equipment lending platform. We start
            from a simple observation: sports gear is often expensive and only
            used a few times. With Pickit, everyone can lend, borrow, and enjoy
            sports more freely without unnecessary purchases. Our goal is to
            make sharing easier, build trust between users, and make sports more
            accessible to everyone.
          </p>
          <p className="about-closing">Because sport is meant to be shared.</p>
        </div>

        <img
          className="about-img"
          src={AboutLanding}
          alt=""
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

export default About;
