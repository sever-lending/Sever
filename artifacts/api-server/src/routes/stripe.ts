import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable, processedSessionsTable } from "@workspace/db";
import { getUncachableStripeClient, getStripePublishableKey } from "../lib/stripeClient";
import { ensureProfile, buildMyProfile } from "./profile";
import { num, round2 } from "../lib/lending";

const router: IRouter = Router();

router.get("/stripe/publishable-key", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (err: any) {
    req.log.error({ err }, "Failed to get Stripe publishable key");
    res.status(500).json({ error: "Stripe not configured" });
  }
});

router.post("/stripe/checkout-session", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { amount } = req.body;
  if (!amount || typeof amount !== "number" || amount < 10 || amount > 100000) {
    res.status(400).json({ error: "Amount must be between $10 and $100,000" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();

    const domains = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost";
    const baseUrl = domains.startsWith("localhost")
      ? `http://${domains}`
      : `https://${domains}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sever Wallet Deposit",
              description: `Add $${amount.toFixed(2)} to your lending wallet`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user.id,
        depositAmount: amount.toFixed(2),
      },
      success_url: `${baseUrl}/wallet?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/wallet?deposit=cancelled`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create Stripe checkout session");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/stripe/confirm-deposit", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { sessionId } = req.body;
  if (!sessionId || typeof sessionId !== "string") {
    res.status(400).json({ error: "sessionId required" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      res.status(402).json({ error: "Payment not completed" });
      return;
    }

    if (session.metadata?.userId !== req.user.id) {
      res.status(403).json({ error: "Session does not belong to this user" });
      return;
    }

    const depositAmount = parseFloat(session.metadata?.depositAmount ?? "0");
    if (!depositAmount || depositAmount <= 0) {
      res.status(400).json({ error: "Invalid deposit amount in session" });
      return;
    }

    await ensureProfile(req.user.id);

    let credited = false;
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(processedSessionsTable)
        .values({
          sessionId,
          userId: req.user.id,
          depositAmount: depositAmount.toFixed(2),
        })
        .onConflictDoNothing()
        .returning();

      if (inserted.length === 0) {
        return;
      }

      const [profile] = await tx
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, req.user.id))
        .for("update");

      if (!profile) {
        throw new Error("Profile not found");
      }

      const newBalance = round2(num(profile.walletBalance) + depositAmount);
      await tx
        .update(profilesTable)
        .set({ walletBalance: newBalance.toFixed(2) })
        .where(eq(profilesTable.userId, req.user.id));

      credited = true;
    });

    if (!credited) {
      res.status(409).json({ error: "Session already processed" });
      return;
    }

    const out = await buildMyProfile(req.user.id);
    res.json({ success: true, newBalance: out.walletBalance, depositAmount });
  } catch (err: any) {
    req.log.error({ err }, "Failed to confirm deposit");
    res.status(500).json({ error: "Failed to confirm deposit" });
  }
});

export default router;
