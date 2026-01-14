import { useState } from "react";
import "./ButtonDelete.css";

interface buttonDeleteProps {
  annonceId: number;
}

function ButtonDelete({ annonceId }: buttonDeleteProps) {
  const [status, setStatus] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const openPopup = () => {
    setIsOpen(true);
  };
  const closePopup = () => {
    setIsOpen(false);
  };

  //   const openPopup1 = () => {
  //     setIsOpen1(true);
  //   };
  // This building code is read but not used

  const closePopup1 = () => {
    setIsOpen1(false);
  };

  const handleclickdelete = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcesDelete?id=${annonceId}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setIsOpen(false);
        setIsOpen1(true);

        setStatus("The item has been deleted !");
      } else {
        setIsOpen(false);
        setIsOpen1(true);

        setStatus("An error has occured");
      }
    } catch (err) {}
  };

  return (
    <>
      <button
        type="button"
        className="secondary"
        onClick={openPopup}
        aria-label="delete-announcement"
      >
        Delete
      </button>
      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div>
              <h4 className="title-popup">
                Are you sure you want to delete your item
              </h4>
              <p className="avertissement-popup">
                The content you are editing has changed by other user.
                <br />
                If you update the content you will lose your draft. Do you
                <br /> want to continue?
              </p>
            </div>
            <div>
              <button
                type="button"
                className="primary"
                onClick={handleclickdelete}
                aria-label="delete the ad"
              >
                Delete
              </button>
              <button
                type="button"
                className="secondary"
                onClick={closePopup}
                aria-label="cancel the removal of the ad"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isOpen1 && (
        <div className="popup-overlay1">
          <div className="popup-content1">
            <div>
              <h4>{status}</h4>
              <div className="button-popup2">
                <button
                  type="button"
                  className="primary"
                  onClick={closePopup1}
                  aria-label="close popup"
                >
                  thank you
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ButtonDelete;
