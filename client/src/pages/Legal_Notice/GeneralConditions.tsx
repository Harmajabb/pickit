import type React from "react";
import "./GeneralConditions.css";

const GeneralConditions: React.FC = () => {
  return (
    <main className="legal-container">
      <h1 className="legal-title">General Terms of Use</h1>

      <section className="legal-section">
        <h2>1. Purpose</h2>
        <p>These General Terms of Use govern the use of the Pickit platform.</p>
      </section>

      <section className="legal-section">
        <h2>2. Access to the service</h2>
        <p>
          This site is accessible free of charge to any user with internet
          access.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Responsibility</h2>
        <p>
          Pickit cannot be held responsible for service interruptions or data
          losses.
        </p>
      </section>
    </main>
  );
};

export default GeneralConditions;
