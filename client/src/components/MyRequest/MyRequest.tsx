import { useEffect, useState } from "react";
import "./MyRequest.css";

interface BorrowRequest {
  id: number;
  item_title: string;
  borrower_name: string;
  status: string;
}

function MyRequests() {
  const [borrows, setBorrows] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/borrows`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setBorrows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur fetch:", err);
        setLoading(false);
      });
  }, []);

  const handleAction = async (id: number, status: string) => {
    try {
      const response = await fetch(`${API_URL}/api/borrows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (response.ok) {
        setBorrows((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b)),
        );
      }
    } catch (error) {
      console.error("Erreur action:", error);
    }
  };

  if (loading)
    return (
      <p style={{ color: "var(--color-primary-text)", padding: "20px" }}>
        Loading requests...
      </p>
    );

  return (
    <div
      style={{
        padding: "40px 20px",
        // We use the theme variables
        backgroundColor: "var(--color-bg)",
        minHeight: "100vh",
        color: "var(--color-primary-text)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "30px",
            fontWeight: "bold",
            color: "var(--color-title)",
          }}
        >
          Borrow Requests
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {borrows.length > 0 ? (
            borrows.map((b, index) => (
              <div
                key={`${b.id}-${index}`}
                style={{
                  display: "flex",
                  // We put quotation marks here
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--color-card)",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-btn)",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "var(--color-title)",
                    }}
                  >
                    {b.item_title}
                  </p>
                  <p
                    style={{
                      margin: "5px 0",
                      color: "var(--color-primary-text)",
                      opacity: 0.7,
                      fontSize: "0.9rem",
                    }}
                  >
                    Requested by:{" "}
                    <span style={{ color: "var(--color-title)" }}>
                      {b.borrower_name}
                    </span>
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      color:
                        b.status === "confirmed"
                          ? "#22c55e"
                          : b.status === "rejected"
                            ? "#ef4444"
                            : "#eab308",
                      textTransform: "uppercase",
                    }}
                  >
                    Status: {b.status}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {b.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAction(b.id, "confirmed")}
                        style={{
                          backgroundColor: "var(--color-btn)",
                          color: "#000",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(b.id, "rejected")}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Refuse
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                backgroundColor: "var(--color-card)",
                borderRadius: "12px",
              }}
            >
              <p style={{ color: "var(--color-primary-text)", opacity: 0.6 }}>
                No borrow requests for your items yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyRequests;
