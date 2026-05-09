import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  profilesTable,
  usersTable,
  loansTable,
  fundingsTable,
} from "@workspace/db";
import {
  GetMyProfileResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
  WithdrawFundsBody,
  WithdrawFundsResponse,
  ChangeUsernameResponse,
} from "@workspace/api-zod";
import { z } from "zod";
import { num, round2, tierFromScore } from "../lib/lending";

const UsernameSchema = z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/);

const router: IRouter = Router();

async function ensureProfile(userId: string) {
  const [existing] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId));
  if (existing) return existing;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Anonymous";

  const [created] = await db
    .insert(profilesTable)
    .values({
      userId,
      displayName,
      walletBalance: "0",
    })
    .returning();
  return created;
}

async function buildMyProfile(userId: string) {
  const profile = await ensureProfile(userId);
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  const [borrowAgg] = await db
    .select({
      count: sql<number>`count(*)::int`,
      total: sql<string>`coalesce(sum(${loansTable.principal}), 0)::text`,
    })
    .from(loansTable)
    .where(eq(loansTable.borrowerId, userId));

  const [lendAgg] = await db
    .select({
      count: sql<number>`count(distinct ${fundingsTable.loanId})::int`,
      total: sql<string>`coalesce(sum(${fundingsTable.amount}), 0)::text`,
    })
    .from(fundingsTable)
    .where(eq(fundingsTable.lenderId, userId));

  const trustScore = profile.trustScore;
  return GetMyProfileResponse.parse({
    id: profile.userId,
    username: profile.username ?? null,
    displayName: profile.displayName,
    bio: profile.bio,
    profileImageUrl: user?.profileImageUrl ?? null,
    walletBalance: num(profile.walletBalance),
    trustScore,
    tier: tierFromScore(trustScore),
    loansFunded: lendAgg?.count ?? 0,
    loansBorrowed: borrowAgg?.count ?? 0,
    totalLent: num(lendAgg?.total ?? 0),
    totalBorrowed: num(borrowAgg?.total ?? 0),
    onTimePayments: profile.onTimePayments,
    latePayments: profile.latePayments,
  });
}

router.get("/profile/me", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const out = await buildMyProfile(req.user.id);
  res.json(out);
});

router.patch("/profile/me", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureProfile(req.user.id);
  await db
    .update(profilesTable)
    .set({
      displayName: parsed.data.displayName,
      bio: parsed.data.bio ?? null,
    })
    .where(eq(profilesTable.userId, req.user.id));
  const out = await buildMyProfile(req.user.id);
  res.json(UpdateMyProfileResponse.parse(out));
});

router.put("/profile/username", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = UsernameSchema.safeParse(req.body?.username);
  if (!parsed.success) {
    res.status(400).json({ error: "Username must be 3-30 characters, letters, numbers and underscores only." });
    return;
  }
  const username = parsed.data;
  await ensureProfile(req.user.id);
  try {
    await db
      .update(profilesTable)
      .set({ username })
      .where(eq(profilesTable.userId, req.user.id));
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "That username is already taken. Try another." });
      return;
    }
    throw err;
  }
  const out = await buildMyProfile(req.user.id);
  res.json(ChangeUsernameResponse.parse(out));
});

router.post("/profile/withdraw", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = WithdrawFundsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const profile = await ensureProfile(req.user.id);
  const balance = num(profile.walletBalance);
  if (parsed.data.amount > balance) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }
  const newBalance = round2(balance - parsed.data.amount);
  await db
    .update(profilesTable)
    .set({ walletBalance: newBalance.toFixed(2) })
    .where(eq(profilesTable.userId, req.user.id));
  const out = await buildMyProfile(req.user.id);
  res.json(WithdrawFundsResponse.parse(out));
});

export { ensureProfile, buildMyProfile };
export default router;
