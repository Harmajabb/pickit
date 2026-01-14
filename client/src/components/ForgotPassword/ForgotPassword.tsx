import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./ForgotPassword.css";

function ForgotPassword() {
  const { initResetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await initResetPassword(email);
      setMessage(
        "If an account with that email exists, a reset link has been sent.",
      );
    } catch (err) {
      setError("Failed to initiate password reset. Please try again later.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form
        aria-label="Forgot password form"
        className="forgot-password-form"
        onSubmit={handleSubmit}
      >
        <label htmlFor="email">Email:</label>
        <input
          aria-label="Email address"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          aria-label="Reset password button"
          className="primary btnreset"
          type="submit"
        >
          Reset Password
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ForgotPassword;
