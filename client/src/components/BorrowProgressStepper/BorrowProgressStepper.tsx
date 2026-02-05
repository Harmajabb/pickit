import { AlertTriangle, CheckCircle, CreditCard, X } from "lucide-react";
import type { FC } from "react";
import "./BorrowProgressStepper.css";

interface BorrowProgressStepperProps {
  status: string;
  depositStatus?: string;
  isOwner?: boolean;
  amountDeposit?: number;
  amountKept?: number;
  amountRefunded?: number;
}

const BorrowProgressStepper: FC<BorrowProgressStepperProps> = ({
  status,
  depositStatus,
  isOwner = false,
  amountDeposit = 0,
  amountKept = 0,
  amountRefunded = 0,
}) => {
  // Define steps for borrower and owner flows
  const borrowerSteps = [
    { key: "pending", label: "Requested" },
    { key: "confirmed", label: "Confirmed" },
    { key: "deposit_paid", label: "Deposit Paid", substatus: "authorized" },
    { key: "ongoing", label: "In Progress" },
    { key: "returned", label: "Returned" },
    { key: "completed", label: "Completed" },
  ];

  const ownerSteps = [
    { key: "pending", label: "New Request" },
    { key: "confirmed", label: "Confirmed" },
    { key: "deposit_paid", label: "Deposit Paid", substatus: "authorized" },
    { key: "ongoing", label: "In Progress" },
    { key: "returned", label: "Returned" },
    { key: "completed", label: "Completed" },
  ];

  const steps = isOwner ? ownerSteps : borrowerSteps;

  // Determine current step index
  const getActiveStepIndex = () => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return depositStatus === "paid" ? 2 : 1;
      case "in_progress":
        return 3;
      case "returned":
        return 4;
      case "completed":
        return 5;
      case "object_broken":
        return 3; // Show as "In Progress" when object is broken
      case "rejected":
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveStepIndex();
  const isErrorStatus = ["rejected", "cancelled"].includes(status);

  return (
    <div className="stepper">
      {isErrorStatus ? (
        <div className="error-status">
          {status === "rejected" && (
            <>
              <X size={18} className="alert-icon" />
              Rejected
            </>
          )}
          {status === "cancelled" && (
            <>
              <X size={18} className="alert-icon" />
              Cancelled
            </>
          )}
          {status === "object_broken" && (
            <>
              <AlertTriangle size={18} className="alert-icon" />
              Object Broken
            </>
          )}
        </div>
      ) : (
        <>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`step ${
                  index < activeIndex ||
                  (index === activeIndex && activeIndex === steps.length - 1)
                    ? "completed"
                    : ""
                } ${index === activeIndex && activeIndex !== steps.length - 1 ? "active" : ""}`}
              >
                <div className="step-circle">
                  {index < activeIndex ? (
                    <span className="checkmark">✓</span>
                  ) : (
                    <span className="step-number">{index + 1}</span>
                  )}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>

          {status === "confirmed" && depositStatus === "not_paid" && (
            <div className="deposit-alert">
              <CreditCard size={18} className="alert-icon" />
              Awaiting deposit payment
            </div>
          )}

          {status === "completed" && depositStatus === "refunded" && (
            <div className="deposit-alert">
              <CheckCircle size={18} className="alert-icon" />
              Deposit Refunded (€{amountDeposit})
            </div>
          )}

          {status === "completed" && depositStatus === "kept" && (
            <div className="deposit-alert">
              <CheckCircle size={18} className="alert-icon" />
              Deposit Kept (€{amountKept}) - Refunded: €
              {(amountDeposit - amountKept).toFixed(2)}
            </div>
          )}

          {status === "object_broken" && (
            <div className="warning-alert">
              <AlertTriangle size={18} className="alert-icon" />
              Object Broken - Amount refunded to borrower: €
              {typeof amountRefunded === "number" && amountRefunded > 0
                ? amountRefunded.toFixed(2)
                : typeof amountDeposit === "number"
                  ? amountDeposit.toFixed(2)
                  : "0.00"}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BorrowProgressStepper;
