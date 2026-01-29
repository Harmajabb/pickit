import { useContext, useState } from "react";
import { useParams } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import "./ResetPassword.css";

function ResetPassword() {
  const { resetPassword } = useContext(AuthContext);
  const { token } = useParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    try {
      await resetPassword(token, currentPassword, newPassword);
      setMessage("Password has been reset successfully.");
      setNewPassword("");
      setCurrentPassword("");
    } catch (err: unknown) {
      // If the backend returns Joi errors, display the first one or a generic message
      const serverMessage =
        (
          err as {
            response?: { data?: { errors?: string[]; message?: string } };
          }
        ).response?.data?.errors?.[0] ||
        (
          err as {
            response?: { data?: { errors?: string[]; message?: string } };
          }
        ).response?.data?.message;
      setError(
        serverMessage || "Failed to reset password. Please try again later.",
      );
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form
        aria-label="Reset password form"
        className="reset-password-form"
        onSubmit={handleSubmit}
      >
        <label htmlFor="current-password">Current Password:</label>
        <input
          type="password"
          id="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <label htmlFor="new-password">New Password:</label>
        <input
          aria-label="New password"
          type="password"
          id="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button
          aria-label="Set new password button"
          className="primary btnreset"
          type="submit"
        >
          Set New Password
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ResetPassword;
