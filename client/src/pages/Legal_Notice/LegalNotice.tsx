import type React from "react";
import "./LegalNotice.css";

const LegalNotice: React.FC = () => {
  return (
    <main className="legal-container">
      <h1 className="legal-title">Legal Notices</h1>

      <section className="legal-section">
        <h2>1. Website publisher</h2>
        <p>
          The site <strong>Pickit</strong> is published by the Project 3 team.
        </p>
        <p>
          <strong>Publication manager :</strong> The Team Rocket{" "}
        </p>
        <p>
          <strong>Contact :</strong> contact@pickit.com
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Accommodation</h2>
        <p>
          This site is hosted by [Hosting Provider Name], [Hosting Provider
          Address].
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Intellectual property</h2>
        <p>All content on this site is protected by copyright law.</p>
      </section>
    </main>
  );
};

export default LegalNotice;
