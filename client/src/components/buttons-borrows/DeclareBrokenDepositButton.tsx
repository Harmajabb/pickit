import type { FC } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import "./DeclareBrokenDepositButton.css";

interface DeclareBrokenDepositButtonProps {
  borrowId: number;
  onClick: (borrowId: number, amount?: number, reason?: string) => void;
  isLoading?: boolean;
}

const DeclareBrokenDepositButton: FC<DeclareBrokenDepositButtonProps> = ({
  borrowId,
  onClick,
  isLoading = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the broken equipment");
      return;
    }

    onClick(
      borrowId,
      amount ? Number.parseFloat(amount) : undefined,
      reason.trim(),
    );

    setAmount("");
    setReason("");
    setShowModal(false);
  };

  const handleCancel = () => {
    setAmount("");
    setReason("");
    setShowModal(false);
  };

  return (
    <>
      <button
        type="button"
        className="button"
        onClick={() => setShowModal(true)}
        disabled={isLoading}
        title="Declare equipment broken"
      >
        {isLoading ? "Processing..." : "Declare Broken"}
      </button>

      {showModal &&
        createPortal(
          <>
            <button
              type="button"
              className="modal-overlay"
              onClick={handleCancel}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCancel();
              }}
              aria-label="Close modal"
              tabIndex={0}
            />
            <div
              className="modal-content"
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCancel();
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <h3 className="modal-title" id="modal-title">
                Declare Equipment Broken
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="form"
              >
                <div className="form-group">
                  <label htmlFor="reason" className="label">
                    Reason for damage{" "}
                    <span className="required-indicator">*</span>
                  </label>
                  <textarea
                    id="reason"
                    className="textarea"
                    placeholder="Describe why the equipment is broken..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount" className="label">
                    Refund amount (€){" "}
                    <span style={{ fontSize: "0.8rem", fontWeight: "400" }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    id="amount"
                    type="number"
                    className="input"
                    placeholder="Leave empty to refund full amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    disabled={isLoading}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading || !reason.trim()}
                  >
                    {isLoading ? "Processing..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

export default DeclareBrokenDepositButton;
