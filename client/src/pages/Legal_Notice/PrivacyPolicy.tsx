import type React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <main className="legal-container">
      <h1 className="legal-title">Privacy Policy</h1>

      <section className="legal-section">
        <h2>1. Data Collection</h2>
        <p>
          We collect data strictly necessary for the operation of the service.
          du service.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Use of data</h2>
        <p>
          Your data is never sold to third parties and is only used to improve
          Pickit.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Your rights</h2>
        <p>
          In accordance with the GDPR, you have the right to modify and delete
          your data.
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
