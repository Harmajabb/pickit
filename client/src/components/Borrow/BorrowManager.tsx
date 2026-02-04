import { useEffect, useState } from "react";

// 1. We define the interface to suppress the "noExplicitAny" error
interface Borrow {
  id: number;
  announces_id: number;
  status: string;
  borrow_date: string;
  return_date: string;
}

function BorrowManager() {
  // We specify that the state is an array of "Borrow"
  const [borrows, setBorrows] = useState<Borrow[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/borrows`)
      .then((res) => res.json())
      .then((data) => setBorrows(data))
      .catch((err) => console.error("Erreur :", err));
  }, []);

  return (
    <div className="borrow-list">
      <h3>My loan applications received</h3>
      {borrows.length === 0 ? (
        <p>No requests at the moment.</p>
      ) : (
        borrows.map((borrow) => (
          <div
            key={borrow.id}
            className="borrow-item"
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
            }}
          >
            <p>Announce n° : {borrow.announces_id}</p>
            <p>
              Status : <strong>{borrow.status}</strong>
            </p>

            {/* 2. We add type="button" to suppress the "useButtonType" error */}
            <button type="button">Accept</button>
            <button type="button">Refuse</button>
          </div>
        ))
      )}
    </div>
  );
}

export default BorrowManager;
