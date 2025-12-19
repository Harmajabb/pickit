import "./Testimony.css";

const Testimony = () => {
  return (
    <div className="container-temoignage">
      <div className="wrapper-avis">
        <h2 className="titre-section">Testimony</h2>

        <div className="carte-principale">
          <div className="en-tete">
            <div className="avatar-cercle">
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
                aria-labelledby="userIconTitle"
              >
                <title id="userIconTitle">Icône utilisateur</title>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="nom-utilisateur">Matt Cannon</p>
              <p className="poste-utilisateur">Head of Marketing</p>
            </div>
          </div>

          <p className="texte-avis">
            Lorem ipsum dolor sit amet conse ctetur adipiscing lectus a nunc
            mauris scelerisque sed egestas pharetraol quis pharetra arcu
            pharetra blandit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Testimony;
