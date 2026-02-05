import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router";

interface CheckoutFormProps {
  borrowId: number;
  announceId: number;
  start_borrow_date: Date;
  end_borrow_date: Date;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  borrowId,
  announceId,
  start_borrow_date,
  end_borrow_date,
}) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `http://localhost:3000/deposit/success/${borrowId}`,
      },
    });

    if (error) {
      console.log(error.message);
      setMessage(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      console.log("Payment succeeded, securing deposit...");

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/borrows/secure-deposit`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              borrowId: borrowId,
              announceId: announceId,
              start_borrow_date: start_borrow_date,
              end_borrow_date: end_borrow_date,
            }),
          },
        );

        if (response.ok) {
          console.log("Secure deposit succeeded, updating status...");
          try {
            // Mettre à jour le statut de dépôt à 'paid'
            console.log(
              `Sending PUT request to update borrow ${borrowId} deposit_status to paid`,
            );
            const updateResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/borrows/${borrowId}`,
              {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  deposit_status: "paid",
                }),
              },
            );

            console.log(`Update response status: ${updateResponse.status}`);
            const updateData = await updateResponse.json();
            console.log("Update response data:", updateData);

            if (updateResponse.ok) {
              console.log("✅ Deposit status updated to 'paid'");
            } else {
              console.error(
                "❌ Failed to update deposit status:",
                updateResponse.status,
                updateData,
              );
            }
          } catch (err) {
            console.error("Error updating deposit status:", err);
          }

          setMessage(
            "Payement success ! Deposit secured successfully! Redirecting...",
          );
          setTimeout(() => {
            navigate("/profile/requests");
          }, 3000);
        } else {
          const errorData = await response.json();
          console.error(errorData);
          setMessage("An error occurred while securing the deposit.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Error network with the server.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      <button className="cta" type="submit" disabled={!stripe}>
        Deposit Payment
      </button>
      {message && <div>{message}</div>}
    </form>
  );
};

export default CheckoutForm;
