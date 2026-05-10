import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, profilesTable, processedSessionsTable, usersTable } from "@workspace/db";
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

router.post("/stripe/donation-session", async (req, res): Promise<void> => {
  const raw = Number(req.body?.amount);
  if (!raw || !isFinite(raw) || raw < 1 || raw > 50000) {
    res.status(400).json({ error: "Amount must be between $1 and $50,000." });
    return;
  }
  const amount = Math.round(raw * 100) / 100;

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
              name: "Support Sever Lending",
              description: "Helps cover server costs, development, and platform improvements",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { type: "donation", amount: amount.toFixed(2) },
      success_url: `${baseUrl}/support?donated=1`,
      cancel_url: `${baseUrl}/support`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create donation session");
    res.status(500).json({ error: "Failed to create donation session" });
  }
});

// ─── Premium subscription (auto-renewing) ─────────────────────────────────────

function getBaseUrl(): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost";
  return domain.startsWith("localhost") ? `http://${domain}` : `https://${domain}`;
}

/**
 * Create a Stripe Checkout session in subscription mode.
 * Reuses an existing Stripe Customer for this user so payment methods are saved.
 */
router.post("/stripe/premium-session", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { plan } = req.body;
  if (plan !== "monthly" && plan !== "annual") {
    res.status(400).json({ error: "plan must be 'monthly' or 'annual'" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();
    const profile = await ensureProfile(req.user.id);

    // Reuse the Stripe Customer so the user's saved card carries over on renewal
    let customerId = profile.stripeCustomerId ?? undefined;
    if (!customerId) {
      const [user] = await db
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, req.user.id));
      const customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        metadata: { userId: req.user.id },
      });
      customerId = customer.id;
      await db
        .update(profilesTable)
        .set({ stripeCustomerId: customerId })
        .where(eq(profilesTable.userId, req.user.id));
    }

    const interval = plan === "monthly" ? "month" : "year";
    const unitAmount = plan === "monthly" ? 1499 : 9900;
    const planLabel =
      plan === "monthly" ? "Monthly — $14.99/mo" : "Annual — $99/yr (save 45%)";
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sever Premium",
              description: planLabel,
            },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: req.user.id, type: "premium", plan },
      subscription_data: { metadata: { userId: req.user.id, plan } },
      success_url: `${baseUrl}/?premium_session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${baseUrl}/`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create premium subscription session");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

/**
 * Called on return from Stripe Checkout.
 * Retrieves the completed session + subscription, then idempotently activates premium.
 */
router.post("/stripe/confirm-premium", async (req, res): Promise<void> => {
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
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "subscription.items"],
    });

    if (session.payment_status !== "paid") {
      res.status(402).json({ error: "Payment not completed" });
      return;
    }
    if (session.metadata?.userId !== req.user.id) {
      res.status(403).json({ error: "Session does not belong to this user" });
      return;
    }
    if (session.metadata?.type !== "premium") {
      res.status(400).json({ error: "Not a premium session" });
      return;
    }

    const subscription = session.subscription as Stripe.Subscription;
    // In Stripe SDK v20, current_period_end lives on each SubscriptionItem
    const periodEnd = new Date(subscription.items.data[0].current_period_end * 1000);
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const pricePaid = round2((session.amount_total ?? 0) / 100);

    let activated = false;
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(processedSessionsTable)
        .values({ sessionId, userId: req.user.id, depositAmount: pricePaid.toFixed(2) })
        .onConflictDoNothing()
        .returning();

      if (inserted.length === 0) return;

      await tx
        .update(profilesTable)
        .set({
          isPremium: true,
          premiumSince: new Date(),
          premiumUntil: periodEnd,
          stripeCustomerId: customerId ?? undefined,
          stripeSubscriptionId: subscription.id,
        })
        .where(eq(profilesTable.userId, req.user.id));

      activated = true;
    });

    const out = await buildMyProfile(req.user.id);
    res.json({ success: true, activated, premiumUntil: out.premiumUntil });
  } catch (err: any) {
    req.log.error({ err }, "Failed to confirm premium");
    res.status(500).json({ error: "Failed to confirm premium" });
  }
});

/**
 * Stripe webhook — keeps DB in sync with subscription lifecycle.
 *
 * Events handled:
 *   invoice.payment_succeeded   → extend premiumUntil to new period end
 *   customer.subscription.updated → sync status + period end on plan changes
 *   customer.subscription.deleted → revoke premium
 *
 * Set STRIPE_WEBHOOK_SECRET (from the Stripe Dashboard → Webhooks) to enable
 * signature verification. Without it the endpoint still works in development.
 */
router.post("/stripe/webhook", async (req, res): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody: Buffer | undefined = (req as any).rawBody;

  let event: Stripe.Event;

  if (webhookSecret && sig && rawBody) {
    try {
      const stripe = await getUncachableStripeClient();
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      req.log.warn({ err }, "Stripe webhook signature verification failed");
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }
  } else {
    event = req.body as Stripe.Event;
  }

  try {
    const stripe = await getUncachableStripeClient();

    switch (event.type) {
      case "invoice.payment_succeeded": {
        // In Stripe v20, subscription ref is nested under invoice.parent.subscription_details
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id;
        if (!subId) break;
        // Retrieve subscription with items expanded so we can read current_period_end
        const sub = await stripe.subscriptions.retrieve(subId, { expand: ["items"] });
        const periodEnd = new Date(sub.items.data[0].current_period_end * 1000);
        await db
          .update(profilesTable)
          .set({ isPremium: true, premiumUntil: periodEnd })
          .where(eq(profilesTable.stripeSubscriptionId, subId));
        req.log.info({ subId, periodEnd }, "Premium renewed via invoice.payment_succeeded");
        break;
      }

      case "customer.subscription.updated": {
        // Webhook payload already includes items list
        const sub = event.data.object as Stripe.Subscription;
        const periodEnd = new Date(sub.items.data[0].current_period_end * 1000);
        const active = sub.status === "active" || sub.status === "trialing";
        await db
          .update(profilesTable)
          .set({ isPremium: active, premiumUntil: active ? periodEnd : null })
          .where(eq(profilesTable.stripeSubscriptionId, sub.id));
        req.log.info({ subId: sub.id, status: sub.status, active }, "Subscription updated");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(profilesTable)
          .set({ isPremium: false, premiumUntil: null, stripeSubscriptionId: null })
          .where(eq(profilesTable.stripeSubscriptionId, sub.id));
        req.log.info({ subId: sub.id }, "Premium cancelled via subscription.deleted");
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err: any) {
    req.log.error({ err }, "Webhook processing error");
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * Stripe Billing Portal — lets premium users manage or cancel their subscription.
 * Returns a { url } the client should redirect to.
 */
router.post("/stripe/portal-session", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const profile = await ensureProfile(req.user.id);
    if (!profile.stripeCustomerId) {
      res.status(404).json({ error: "No Stripe customer found — you may not have an active subscription." });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = getBaseUrl();

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${baseUrl}/profile`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create billing portal session");
    res.status(500).json({ error: "Failed to open subscription management" });
  }
});

export default router;
