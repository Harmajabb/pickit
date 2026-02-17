import { CheckCircle, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import "./StripeConnect.css";

interface StripeConnectStatus {
  connected: boolean;
  onboardingComplete: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  accountId?: string;
}

function StripeConnect() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/stripe/connect/status`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching Stripe Connect status:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartOnboarding = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/stripe/connect/create-account`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (data.onboardingComplete) {
        setStatus({
          connected: true,
          onboardingComplete: true,
          accountId: data.accountId,
        });
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error starting Stripe Connect onboarding:", error);
    } finally {
      setActionLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Check URL params for onboarding redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe_onboarding") === "success") {
      fetchStatus();
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("stripe_refresh") === "true") {
      handleStartOnboarding();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [fetchStatus, handleStartOnboarding]);

  const handleOpenDashboard = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/stripe/connect/dashboard-link`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening Stripe dashboard:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stripe-connect-section">
        <Loader2 size={18} className="spinner" />
        Loading payment settings...
      </div>
    );
  }

  const isFullyConnected = status?.connected && status?.onboardingComplete;

  return (
    <div className="stripe-connect-section">
      <h3>
        <CreditCard size={18} />
        Payment Settings
      </h3>
      <p>
        Connect your Stripe account to receive compensation when a borrower
        damages your equipment.
      </p>

      {isFullyConnected ? (
        <>
          <div className="stripe-connect-status connected">
            <CheckCircle size={16} />
            Stripe account connected — you can receive payments
          </div>
          <div className="stripe-connect-actions">
            <button
              type="button"
              className="stripe-connect-btn secondary"
              onClick={handleOpenDashboard}
              disabled={actionLoading}
            >
              <ExternalLink size={16} />
              {actionLoading ? "Loading..." : "Open Stripe Dashboard"}
            </button>
          </div>
        </>
      ) : status?.connected && !status?.onboardingComplete ? (
        <>
          <div className="stripe-connect-status pending">
            <Loader2 size={16} />
            Onboarding incomplete — please finish setting up your account
          </div>
          <div className="stripe-connect-actions">
            <button
              type="button"
              className="stripe-connect-btn primary"
              onClick={handleStartOnboarding}
              disabled={actionLoading}
            >
              {actionLoading ? "Redirecting..." : "Complete Setup"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="stripe-connect-status not-connected">
            No payment account connected
          </div>
          <div className="stripe-connect-actions">
            <button
              type="button"
              className="stripe-connect-btn primary"
              onClick={handleStartOnboarding}
              disabled={actionLoading}
            >
              <CreditCard size={16} />
              {actionLoading ? "Redirecting..." : "Connect Stripe Account"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default StripeConnect;
