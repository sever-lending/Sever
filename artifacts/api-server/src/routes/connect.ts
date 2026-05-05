import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { ensureProfile, buildMyProfile } from "./profile";
import { num, round2 } from "../lib/lending";

const router: IRouter = Router();

router.post("/connect/onboard", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();
    const domains = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost";
    const baseUrl = domains.startsWith("localhost") ? `http://${domains}` : `https://${domains}`;

    const profile = await ensureProfile(req.user.id);

    let accountId = profile.stripeConnectId ?? null;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        metadata: { userId: req.user.id },
      });
      accountId = account.id;
      await db
        .update(profilesTable)
        .set({ stripeConnectId: accountId })
        .where(eq(profilesTable.userId, req.user.id));
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/wallet?connect=refresh`,
      return_url: `${baseUrl}/wallet?connect=success`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create Connect onboarding link");
    res.status(500).json({ error: "Failed to start bank account setup" });
  }
});

router.get("/connect/status", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const profile = await ensureProfile(req.user.id);
    if (!profile.stripeConnectId) {
      res.json({ connected: false });
      return;
    }
    const stripe = await getUncachableStripeClient();
    const account = await stripe.accounts.retrieve(profile.stripeConnectId);
    res.json({
      connected: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (err: any) {
    req.log.error({ err }, "Failed to check Connect status");
    res.json({ connected: false });
  }
});

router.post("/connect/payout", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { amount } = req.body;
  if (!amount || typeof amount !== "number" || amount < 1) {
    res.status(400).json({ error: "Amount must be at least $1" });
    return;
  }

  try {
    await ensureProfile(req.user.id);

    let stripeConnectId: string | null = null;
    let insufficientBalance = false;

    await db.transaction(async (tx) => {
      const [locked] = await tx
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, req.user.id))
        .for("update");

      if (!locked) {
        throw new Error("Profile not found");
      }

      if (!locked.stripeConnectId) {
        return;
      }

      const balance = num(locked.walletBalance);
      if (amount > balance) {
        insufficientBalance = true;
        return;
      }

      stripeConnectId = locked.stripeConnectId;
      const newBalance = round2(balance - amount);
      await tx
        .update(profilesTable)
        .set({ walletBalance: newBalance.toFixed(2) })
        .where(eq(profilesTable.userId, req.user.id));
    });

    if (stripeConnectId === null && !insufficientBalance) {
      res.status(400).json({ error: "Bank account not connected. Please set up your bank account first." });
      return;
    }

    if (insufficientBalance) {
      res.status(400).json({ error: "Insufficient balance" });
      return;
    }

    try {
      const stripe = await getUncachableStripeClient();
      await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        destination: stripeConnectId!,
        metadata: { userId: req.user.id },
      });
    } catch (stripeErr: any) {
      req.log.error({ err: stripeErr }, "Stripe transfer failed after balance deduction — refunding");
      await db
        .update(profilesTable)
        .set({
          walletBalance: sql`wallet_balance + ${amount.toFixed(2)}::numeric`,
        })
        .where(eq(profilesTable.userId, req.user.id));
      res.status(502).json({ error: "Payout failed. Your balance has been restored. Please try again." });
      return;
    }

    const out = await buildMyProfile(req.user.id);
    res.json({ success: true, newBalance: out.walletBalance });
  } catch (err: any) {
    req.log.error({ err }, "Failed to process payout");
    res.status(500).json({ error: "Payout failed. Please try again." });
  }
});

export default router;
