import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BorrowProgressStepper from "../BorrowProgressStepper/BorrowProgressStepper";
import DeclareBrokenDepositButton from "../buttons-borrows/DeclareBrokenDepositButton";
import DeclareDepositConformedButton from "../buttons-borrows/DeclareDepositConformedButton";
import DeclareReturnedDepositButton from "../buttons-borrows/DeclareReturnedDepositButton";
import "./MyRequest.css";

interface BorrowRequest {
  id: number;
  item_title: string;
  borrower_name: string;
  status: string;
  owner_name: string;
  deposit_status?: string;
  amount_deposit?: number;
  amount_refunded?: number;
  amount_kept?: number;
}

function MyRequests() {
  const [Owner, setOwner] = useState<BorrowRequest[]>([]);
  const [Borrower, setBorrower] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState<{
    [key: number]: boolean;
  }>({});
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resOwner, resBorrower] = await Promise.all([
          fetch(`${API_URL}/api/borrows/Owner`, { credentials: "include" }),
          fetch(`${API_URL}/api/borrows/Borrower`, { credentials: "include" }),
        ]);

        if (resOwner.ok) {
          const ownerData = await resOwner.json();
          console.log("Owner data fetched:", ownerData);
          setOwner(Array.isArray(ownerData) ? ownerData : []);
        }
        if (resBorrower.ok) {
          const borrowerData = await resBorrower.json();
          console.log("Borrower data fetched:", borrowerData);
          setBorrower(Array.isArray(borrowerData) ? borrowerData : []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Network or parsing error:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAction = async (
    id: number,
    status: string,
    depositStatus: string,
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/borrows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, deposit_status: depositStatus }),
        credentials: "include",
      });

      if (response.ok) {
        setOwner((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, status, deposit_status: depositStatus } : o,
          ),
        );
        setBorrower((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, status, deposit_status: depositStatus } : b,
          ),
        );
      }
    } catch (error) {
      console.error("Erreur action:", error);
    }
  };

  const handleDeclareReturned = async (borrowId: number) => {
    setLoadingActions((prev) => ({ ...prev, [borrowId]: true }));
    try {
      const response = await fetch(
        `${API_URL}/api/borrows/declare-returned-deposit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ borrowId }),
          credentials: "include",
        },
      );

      if (response.ok) {
        setBorrower((prev) =>
          prev.map((b) =>
            b.id === borrowId ? { ...b, deposit_status: "returned" } : b,
          ),
        );
      } else {
        console.error("Failed to declare returned deposit");
      }
    } catch (error) {
      console.error("Error declaring returned deposit:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [borrowId]: false }));
    }
  };

  const handleDeclareConformed = async (borrowId: number) => {
    setLoadingActions((prev) => ({ ...prev, [borrowId]: true }));
    try {
      const response = await fetch(
        `${API_URL}/api/borrows/declare-deposit-conformed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ borrowId }),
          credentials: "include",
        },
      );

      if (response.ok) {
        setOwner((prev) =>
          prev.map((o) =>
            o.id === borrowId ? { ...o, deposit_status: "refunded" } : o,
          ),
        );
      } else {
        console.error("Failed to declare conformed deposit");
      }
    } catch (error) {
      console.error("Error declaring conformed deposit:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [borrowId]: false }));
    }
  };

  const handleDeclareBroken = async (
    borrowId: number,
    amount?: number,
    reason?: string,
  ) => {
    setLoadingActions((prev) => ({ ...prev, [borrowId]: true }));
    try {
      const response = await fetch(
        `${API_URL}/api/borrows/declare-deposit-broken`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ borrowId, amount, reason }),
          credentials: "include",
        },
      );

      if (response.ok) {
        setOwner((prev) =>
          prev.map((o) =>
            o.id === borrowId ? { ...o, deposit_status: "kept" } : o,
          ),
        );
      } else {
        console.error("Failed to declare broken deposit");
      }
    } catch (error) {
      console.error("Error declaring broken deposit:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [borrowId]: false }));
    }
  };

  const shouldShowDepositButtons = (
    status: string,
    depositStatus?: string,
  ): boolean => {
    return (
      status === "in_progress" && (!depositStatus || depositStatus === "paid")
    );
  };

  const shouldShowOwnerReturnButtons = (
    status: string,
    depositStatus?: string,
  ): boolean => {
    return status === "returned" && depositStatus === "paid";
  };

  const shouldShowPayDepositButton = (
    status: string,
    depositStatus?: string,
  ): boolean => {
    return status === "confirmed" && depositStatus === "not_paid";
  };

  const handlePayDeposit = (borrowId: number) => {
    navigate(`/deposit/${borrowId}`);
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="my-requests-page">
      <div>
        <h1 className="my-requests-title">Requests for my items</h1>

        <div className="requests-grid">
          {Owner.length > 0 ? (
            Owner.map((o, index) => (
              <div key={`${o.id}-${index}`} className="borrow-card">
                <div className="borrow-info">
                  <h3>{o.item_title}</h3>
                  <p>
                    Requested by: <span>{o.borrower_name}</span>
                  </p>
                </div>

                <div className="borrow-progress">
                  <BorrowProgressStepper
                    status={o.status}
                    depositStatus={o.deposit_status}
                    isOwner={true}
                    amountDeposit={o.amount_deposit || 0}
                    amountKept={o.amount_kept || 0}
                    amountRefunded={o.amount_refunded || 0}
                  />
                </div>

                <div className="actions-buttons">
                  {o.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(o.id, "confirmed", "not_paid")
                        }
                        className="primary btn-accept"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="secondary btn-refuse"
                        onClick={() =>
                          handleAction(o.id, "rejected", "not_paid")
                        }
                      >
                        Refuse
                      </button>
                    </>
                  )}

                  {shouldShowOwnerReturnButtons(o.status, o.deposit_status) && (
                    <>
                      <DeclareDepositConformedButton
                        borrowId={o.id}
                        onClick={handleDeclareConformed}
                        isLoading={loadingActions[o.id] || false}
                      />
                      <DeclareBrokenDepositButton
                        borrowId={o.id}
                        onClick={handleDeclareBroken}
                        isLoading={loadingActions[o.id] || false}
                      />
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>
              <p>No borrow requests for your items yet.</p>
            </div>
          )}
        </div>

        <h1 className="my-requests-title">Requests I made</h1>
        <div className="requests-grid">
          {Borrower.length > 0 ? (
            Borrower.map((o, index) => (
              <div key={`${o.id}-${index}`} className="borrow-card">
                <div className="borrow-info">
                  <h3>{o.item_title}</h3>
                  <p>
                    Owner: <span>{o.owner_name}</span>
                  </p>
                </div>

                <div className="borrow-progress">
                  <BorrowProgressStepper
                    status={o.status}
                    depositStatus={o.deposit_status}
                    isOwner={false}
                    amountDeposit={o.amount_deposit || 0}
                    amountKept={o.amount_kept || 0}
                    amountRefunded={o.amount_refunded || 0}
                  />
                </div>

                <div className="actions-buttons">
                  {shouldShowPayDepositButton(o.status, o.deposit_status) && (
                    <button
                      type="button"
                      className="primary btn-pay-deposit"
                      onClick={() => handlePayDeposit(o.id)}
                    >
                      Pay Deposit ({o.amount_deposit || "N/A"}€)
                    </button>
                  )}

                  {shouldShowDepositButtons(o.status, o.deposit_status) && (
                    <DeclareReturnedDepositButton
                      borrowId={o.id}
                      onClick={handleDeclareReturned}
                      isLoading={loadingActions[o.id] || false}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div>
              <p>No borrow requests made yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyRequests;
