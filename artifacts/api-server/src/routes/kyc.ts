import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { getUncachableStripeClient } from "../lib/stripeClient";

const router: IRouter = Router();

router.post("/kyc/start-verification", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const stripe = await getUncachableStripeClient();
    const domains = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost";
    const baseUrl = domains.startsWith("localhost") ? `http://${domains}` : `https://${domains}`;

    const session = await (stripe.identity as any).verificationSessions.create({
      type: "document",
      metadata: { userId: req.user.id },
      options: {
        document: {
          allowed_types: ["driving_license", "passport", "id_card"],
          require_id_number: false,
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
      return_url: `${baseUrl}/kyc?verification=complete`,
    });

    await db
      .update(profilesTable)
      .set({ kycSessionId: session.id })
      .where(eq(profilesTable.userId, req.user.id));

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create Stripe Identity session");
    res.status(500).json({ error: "Failed to start verification" });
  }
});

router.post("/kyc/check-status", async (req, res): Promise<void> => {
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
    const [profile] = await db
      .select({ kycSessionId: profilesTable.kycSessionId, kycVerifiedAt: profilesTable.kycVerifiedAt })
      .from(profilesTable)
      .where(eq(profilesTable.userId, req.user.id));

    if (!profile || profile.kycSessionId !== sessionId) {
      res.status(403).json({ error: "Session does not belong to this account" });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const session = await (stripe.identity as any).verificationSessions.retrieve(sessionId);

    if (session.metadata?.userId !== req.user.id) {
      req.log.warn({ sessionId, userId: req.user.id }, "KYC session metadata userId mismatch");
      res.status(403).json({ error: "Session does not belong to this account" });
      return;
    }

    const status: "none" | "pending" | "approved" | "rejected" =
      session.status === "verified"
        ? "approved"
        : session.status === "requires_input"
          ? "rejected"
          : session.status === "processing"
            ? "pending"
            : "none";

    if (status === "approved" && !profile.kycVerifiedAt) {
      await db
        .update(profilesTable)
        .set({ trustScore: 500, kycVerifiedAt: new Date(), kycSessionId: null })
        .where(eq(profilesTable.userId, req.user.id));
    } else if (status === "rejected") {
      await db
        .update(profilesTable)
        .set({ kycSessionId: null })
        .where(eq(profilesTable.userId, req.user.id));
    }

    res.json({ status, sessionId });
  } catch (err: any) {
    req.log.error({ err }, "Failed to check KYC status");
    res.status(500).json({ error: "Failed to check verification status" });
  }
});

export default router;
