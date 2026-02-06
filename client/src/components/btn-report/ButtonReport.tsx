import { X } from "lucide-react";
import { useState } from "react";
import arrow from "../../assets/icons/fleche.svg";
import { reportData } from "./reportData";
import "./ButtonReport.css";
import type { AnnounceDetail } from "../../types/Announce";
import type { Conversation } from "../../types/Chat";
import type { UserPublic } from "../../types/User";

// interface Message {
//   id: number;
//   content?: string;
// }

type ReportAnnouncesProps =
  | { targetType: "annonce"; data: AnnounceDetail }
  | { targetType: "user"; data: UserPublic }
  | { targetType: "message"; data: Conversation };

interface ReportReason {
  id: string;
  label: string;
  desc: string;
}

function ButtonReport({
  targetType,
  data,
  userId,
}: ReportAnnouncesProps & { userId: number | undefined }) {
  const currentReasons = reportData[targetType] ?? [];
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [description, setDescription] = useState("");
  const [confirmations, setConfirmations] = useState("");
  const [modalOpens, setModalOpens] = useState(false);
  const [modalOpens1, setModalOpens1] = useState(false);
  const [modalOpens2, setModalOpens2] = useState(false);
  const openModal = () => {
    setModalOpens(true);
  };

  const closeModal = () => {
    setModalOpens(false);
  };

  const closeModal1 = () => {
    setModalOpens1(false);
  };

  const handleclickreason = (reason: ReportReason) => {
    setSelectedReason(reason);
    setModalOpens1(true);
    setModalOpens(false);
  };

  const handleclickreport = async () => {
    const payload = {
      reporter_id: userId,
      description: description,
      reason: selectedReason?.label,
      status: "pending",
      reported_announce_id: targetType === "annonce" ? data.id : null,
      reported_user_id: targetType === "user" ? data.id : null,
      reported_conversations_id: targetType === "message" ? data.id : null,
    };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        setModalOpens1(false);
        setModalOpens2(true);
        setConfirmations("Ton report a bien été envoyé");
      } else {
        setModalOpens1(false);
        setModalOpens2(true);
        setConfirmations("Une erreur est survenue lors de l'envoi.");
      }
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  const handleclose = () => {
    setModalOpens2(false);
    setModalOpens1(false);
  };

  // Disable button if user is not authenticated
  const isDisabled = userId === undefined;

  return (
    <>
      <button
        type="button"
        className="secondary"
        onClick={openModal}
        disabled={isDisabled}
        aria-label="report"
        title={
          isDisabled ? "You must be logged in to report" : "Report this user"
        }
      >
        Report
      </button>

      {modalOpens && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-bouton">
              {currentReasons.map((reason) => (
                <div key={reason.id}>
                  <button
                    type="button"
                    className="modal-li"
                    onClick={() => handleclickreason(reason)}
                  >
                    {reason.label}

                    <img className="fleche-report" src={arrow} alt="fleche" />
                  </button>
                  <button
                    type="button"
                    className="close-x"
                    onClick={closeModal}
                  >
                    <X size={35} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {modalOpens1 && (
        <div className="modal-overlay1">
          <div className="modal-content1">
            <div>
              <div className="motif-report">
                {selectedReason?.label}
                <textarea
                  maxLength={203}
                  placeholder="Please explain the reason for your report as precisely as possible."
                  style={{ fontStyle: "italic" }}
                  className="text-report"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="button-modal2">
                <button
                  type="button"
                  className="secondary poulet"
                  onClick={handleclickreport}
                  aria-label="close popup"
                >
                  report
                </button>
              </div>
              <button type="button" className="close-x" onClick={closeModal1}>
                <X size={35} />
              </button>
            </div>
          </div>
        </div>
      )}
      {modalOpens2 && (
        <div className="modal-overlay2">
          <div className="modal-content2">
            <div>
              <h4>{confirmations}</h4>
              <div className="button-modal2">
                <button
                  type="button"
                  className="primary"
                  onClick={handleclose}
                  aria-label="close modal"
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

export default ButtonReport;
