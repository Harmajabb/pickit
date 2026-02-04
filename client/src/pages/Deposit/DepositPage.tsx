import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Announce } from "../../types/Announce";
import type { borrows } from "../../types/Borrow";
import "./DepositPage.css";
import CheckoutForm from "../../components/CheckoutForm/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_KeyStripe);

function DepositPage() {
  const { id } = useParams<{ id: string }>();
  const [clientSecret, setClientSecret] = useState("");
  const [borrow, setBorrow] = useState<borrows | null>(null);
  const [announce, setAnnounce] = useState<Announce | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Récupérer l'emprunt (Borrow)
        const borrowRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/borrows/${id}`,
          { method: "GET", credentials: "include" },
        );
        const borrowData = await borrowRes.json();
        if (!borrowData.announces_id) {
          console.error("announceId not found in borrow data");
          return;
        }
        setBorrow(borrowData);
        const announceRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/announces/${borrowData.announces_id}`,
          { method: "GET", credentials: "include" },
        );
        const announceData = await announceRes.json();
        setAnnounce(announceData);

        const paymentRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/borrows/create-payment-intent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              amount: announceData.amount_deposit,
            }),
          },
        );
        const paymentData = await paymentRes.json();
        setClientSecret(paymentData.clientSecret);
      } catch (error) {
        console.error("error fetching payment intent:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div>loading secure transaction...</div>;
  if (!borrow || !announce)
    return <div>Erreur : borrow or announcement not found.</div>;

  return (
    <div className="main-deposit">
      <h1>Payment of the deposit for {announce.title}</h1>
      <p>Deposit for borrow n°{id}</p>

      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            borrowId={Number(id)}
            announceId={Number(announce.id)}
            start_borrow_date={borrow.borrow_date}
            end_borrow_date={borrow.return_date}
          />
        </Elements>
      )}
    </div>
  );
}

export default DepositPage;
