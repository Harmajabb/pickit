import { useContext, useState } from "react";
import "./ContactLenderButton.css";
import { ChatContext } from "../../context/ChatContext";

interface ContactLenderButtonProps {
  announceId: number;
  ownerId: number;
  currentUserId: number | null;
  isAuthenticated: boolean;
  onSuccess?: () => void;
  availableFrom?: Date;
  availableUntil?: Date;
}

interface LoanRequestData {
  announces_id: number;
  borrow_date: string;
  return_date: string;
}

const ContactLenderButton = ({
  announceId,
  ownerId,
  currentUserId,
  isAuthenticated,
  onSuccess,
  availableFrom,
  availableUntil,
}: ContactLenderButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const chatContext = useContext(ChatContext);

  // Dates pour la demande
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Vérifier si c'est sa propre annonce
  const isOwnAnnounce = currentUserId === ownerId;

  // Calculer les limites de dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Date minimum : aujourd'hui OU availableFrom (le plus tard des deux)
  const minDate =
    availableFrom && new Date(availableFrom) > today
      ? new Date(availableFrom).toISOString().split("T")[0]
      : today.toISOString().split("T")[0];

  // Date maximum : availableUntil si défini
  const maxDate = availableUntil
    ? new Date(availableUntil).toISOString().split("T")[0]
    : undefined;

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      setError("You must be logged in to apply for a loan.");
      return;
    }

    // Pré-remplir les dates avec les dates de disponibilité de l'annonce
    if (availableFrom) {
      const fromDate = new Date(availableFrom);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Utiliser availableFrom ou aujourd'hui (le plus tard des deux)
      const startDate = fromDate > today ? fromDate : today;
      setBorrowDate(startDate.toISOString().split("T")[0]);
    }

    if (availableUntil) {
      setReturnDate(new Date(availableUntil).toISOString().split("T")[0]);
    }

    setShowDateModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowDateModal(false);
    setBorrowDate("");
    setReturnDate("");
    setError(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!borrowDate || !returnDate) {
      setError("Please enter the start and end dates.");
      return;
    }

    // Validation des dates
    const borrowDateObj = new Date(borrowDate);
    const returnDateObj = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (borrowDateObj < today) {
      setError("The borrow date cannot be in the past");
      return;
    }

    // Vérifier que la date est dans la période de disponibilité
    if (availableFrom && borrowDateObj < new Date(availableFrom)) {
      setError(
        "The borrow date is before the start of the announcement's availability",
      );
      return;
    }

    if (availableUntil && returnDateObj > new Date(availableUntil)) {
      setError(
        "The return date is after the end of the announcement's availability",
      );
      return;
    }

    if (returnDateObj <= borrowDateObj) {
      setError("The return date must be after the borrow date");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestData: LoanRequestData = {
        announces_id: announceId,
        borrow_date: borrowDate,
        return_date: returnDate,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/loan-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // ← IMPORTANT : envoie les cookies automatiquement
          body: JSON.stringify(requestData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error while sending loan request");
      }

      setSuccess(true);
      setShowDateModal(false);

      if (chatContext && currentUserId) {
        const conversation = await chatContext.createConversation(
          ownerId,
          currentUserId,
          announceId,
        );
        chatContext.selectConversation(conversation);
        chatContext.setIsChatOpen(true);
      }
      // Appeler le callback onSuccess si fourni
      if (onSuccess) {
        onSuccess();
      }

      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Ne pas afficher le bouton si c'est sa propre annonce
  if (isOwnAnnounce) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={isLoading || success}
        className={`primary contact-lender-btn ${success ? "success" : ""}`}
        type="button"
      >
        {success ? "✓ Request sent!" : "Contact the borrower"}
      </button>

      {error && !showDateModal && <p className="error-message">{error}</p>}

      {/* Modal pour sélectionner les dates */}
      {showDateModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              handleCloseModal();
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="document"
          >
            <h2>Loan Request</h2>
            <p className="modal-subtitle">Select the dates for your loan</p>

            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label htmlFor="borrow_date">Start Date</label>
                <input
                  type="date"
                  id="borrow_date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  min={minDate}
                  max={maxDate}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="return_date">Return Date</label>
                <input
                  type="date"
                  id="return_date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={borrowDate || minDate}
                  max={maxDate}
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-cancel"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="primary btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactLenderButton;
