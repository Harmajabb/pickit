import type { RequestHandler } from "express";
import Stripe from "stripe";
import userRepository from "../user/userRepository";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Create a Stripe Connect account for the lender and return the onboarding link
const createConnectAccount: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.auth?.sub);
    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await userRepository.readPrivateById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already has a Stripe Connect account
    if (user.stripe_account_id) {
      // Check if onboarding is already complete
      const account = await stripe.accounts.retrieve(user.stripe_account_id);

      if (account.details_submitted) {
        return res.status(200).json({
          success: true,
          message: "Stripe Connect account already active",
          accountId: user.stripe_account_id,
          onboardingComplete: true,
        });
      }

      // Account exists but onboarding not complete — create new link
      const accountLink = await stripe.accountLinks.create({
        account: user.stripe_account_id,
        refresh_url: `${process.env.CLIENT_URL}/profile/me?stripe_refresh=true`,
        return_url: `${process.env.CLIENT_URL}/profile/me?stripe_onboarding=success`,
        type: "account_onboarding",
      });

      return res.status(200).json({
        success: true,
        url: accountLink.url,
        accountId: user.stripe_account_id,
        onboardingComplete: false,
      });
    }

    // Create a new Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        first_name: user.firstname,
        last_name: user.lastname,
        email: user.email,
      },
    });

    // Save the Stripe account ID to the database
    await userRepository.updateStripeAccountId(userId, account.id);

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.CLIENT_URL}/profile/me?stripe_refresh=true`,
      return_url: `${process.env.CLIENT_URL}/profile/me?stripe_onboarding=success`,
      type: "account_onboarding",
    });

    return res.status(200).json({
      success: true,
      url: accountLink.url,
      accountId: account.id,
      onboardingComplete: false,
    });
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    return res
      .status(500)
      .json({ error: "Failed to create Stripe Connect account" });
  }
};

// Check the status of the user's Stripe Connect account
const getConnectStatus: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.auth?.sub);
    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const stripeAccountId = await userRepository.getStripeAccountId(userId);

    if (!stripeAccountId) {
      return res.status(200).json({
        connected: false,
        onboardingComplete: false,
      });
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);

    return res.status(200).json({
      connected: true,
      onboardingComplete: account.details_submitted ?? false,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      accountId: stripeAccountId,
    });
  } catch (error) {
    console.error("Error fetching Stripe Connect status:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch Stripe Connect status" });
  }
};

// Create a login link for the Stripe Express Dashboard
const createDashboardLink: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.auth?.sub);
    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const stripeAccountId = await userRepository.getStripeAccountId(userId);
    if (!stripeAccountId) {
      return res.status(404).json({ error: "No Stripe Connect account found" });
    }

    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

    return res.status(200).json({
      success: true,
      url: loginLink.url,
    });
  } catch (error) {
    console.error("Error creating Stripe dashboard link:", error);
    return res.status(500).json({ error: "Failed to create dashboard link" });
  }
};

// Transfer funds to a lender's Stripe Connect account
const transferToLender = async (
  stripeAccountId: string,
  amountInEuros: number,
  borrowId: number,
): Promise<Stripe.Transfer> => {
  const transfer = await stripe.transfers.create({
    amount: Math.round(amountInEuros * 100), // Convert to cents
    currency: "eur",
    destination: stripeAccountId,
    transfer_group: `borrow_${borrowId}`,
    description: `Compensation for damaged item - Borrow #${borrowId}`,
  });
  return transfer;
};

export default {
  createConnectAccount,
  getConnectStatus,
  createDashboardLink,
  transferToLender,
};
