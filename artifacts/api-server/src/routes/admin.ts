import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  platformRevenueTable,
  profilesTable,
  loansTable,
  fundingsTable,
  feedbackTable,
  adminUsersTable,
  installmentsTable,
} from "@workspace/db";
import { desc, eq, sql, and } from "drizzle-orm";
import { isAdmin, isOwner, deny } from "../lib/adminAuth";

const router: IRouter = Router();

router.post("/admin/verify", async (req: Request, res: Response): Promise<void> => {
  if (await isAdmin(req)) {
    res.json({ ok: true, isOwner: isOwner(req) });
  } else {
    deny(req, res);
  }
});

/* ─── Overview ─────────────────────────────────────────────────────────── */

router.get("/admin/overview", async (req: Request, res: Response): Promise<void> => {
  if (!(await isAdmin(req))) { deny(req, res); return; }

  const [revTotals] = await db.select({
    total: sql<string>`coalesce(sum(${platformRevenueTable.amount}), 0)::text`,
    count: sql<number>`count(*)::int`,
  }).from(platformRevenueTable);

  const byKind = await db.select({
    kind: platformRevenueTable.kind,
    total: sql<string>`coalesce(sum(${platformRevenueTable.amount}), 0)::text`,
    count: sql<number>`count(*)::int`,
  }).from(platformRevenueTable).groupBy(platformRevenueTable.kind);

  const recentRevenue = await db.select()
    .from(platformRevenueTable)
    .orderBy(desc(platformRevenueTable.createdAt))
    .limit(10);

  const [userStats] = await db.select({
    count: sql<number>`count(*)::int`,
  }).from(profilesTable);

  const [loanStats] = await db.select({
    count: sql<number>`count(*)::int`,
    volume: sql<string>`coalesce(sum(${loansTable.principal}), 0)::text`,
    open: sql<number>`count(*) filter (where ${loansTable.status} = 'open')::int`,
    repaying: sql<number>`count(*) filter (where ${loansTable.status} = 'repaying')::int`,
    repaid: sql<number>`count(*) filter (where ${loansTable.status} = 'repaid')::int`,
    cancelled: sql<number>`count(*) filter (where ${loansTable.status} = 'cancelled')::int`,
    defaulted: sql<number>`count(*) filter (where ${loansTable.status} = 'defaulted')::int`,
  }).from(loansTable);

  const [fundingStats] = await db.select({
    uniqueLenders: sql<number>`count(distinct ${fundingsTable.lenderId})::int`,
    totalDeployed: sql<string>`coalesce(sum(${fundingsTable.amount}), 0)::text`,
  }).from(fundingsTable);

  const [overdueStats] = await db.select({
    count: sql<number>`count(*)::int`,
  }).from(installmentsTable).where(
    and(
      eq(installmentsTable.status, "pending"),
      sql`${installmentsTable.dueDate} < now()`,
    ),
  );

  const recentLoans = await db.select({
    id: loansTable.id,
    title: loansTable.title,
    principal: loansTable.principal,
    status: loansTable.status,
    createdAt: loansTable.createdAt,
    borrowerName: profilesTable.displayName,
    borrowerUsername: profilesTable.username,
  }).from(loansTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, loansTable.borrowerId))
    .orderBy(desc(loansTable.createdAt))
    .limit(5);

  const originationTotal = byKind.find((r) => r.kind === "origination_fee")?.total ?? "0";
  const lateFeeTotal = byKind.find((r) => r.kind === "late_fee")?.total ?? "0";

  res.json({
    revenue: {
      total: parseFloat(revTotals?.total ?? "0"),
      count: revTotals?.count ?? 0,
      originationFees: parseFloat(originationTotal),
      lateFees: parseFloat(lateFeeTotal),
      byKind: byKind.map((r) => ({ kind: r.kind, total: parseFloat(r.total), count: r.count })),
      recent: recentRevenue.map((t) => ({
        id: t.id, kind: t.kind, amount: parseFloat(t.amount), loanId: t.loanId, createdAt: t.createdAt,
      })),
    },
    platform: {
      totalUsers: userStats?.count ?? 0,
      totalLoans: loanStats?.count ?? 0,
      totalVolume: parseFloat(loanStats?.volume ?? "0"),
      openLoans: loanStats?.open ?? 0,
      activeLoans: loanStats?.repaying ?? 0,
      repaidLoans: loanStats?.repaid ?? 0,
      cancelledLoans: loanStats?.cancelled ?? 0,
      defaultedLoans: loanStats?.defaulted ?? 0,
      totalDeployed: parseFloat(fundingStats?.totalDeployed ?? "0"),
      uniqueLenders: fundingStats?.uniqueLenders ?? 0,
      overdueInstallments: overdueStats?.count ?? 0,
    },
    recentLoans: recentLoans.map((l) => ({
      id: l.id,
      title: l.title,
      principal: parseFloat(l.principal),
      status: l.status,
      createdAt: l.createdAt,
      borrowerName: l.borrowerName ?? "Unknown",
      borrowerUsername: l.borrowerUsername,
    })),
  });
});

/* ─── Legacy revenue endpoint (keep for backwards compat) ──────────────── */

router.get("/admin/revenue", async (req: Request, res: Response): Promise<void> => {
  if (!(await isAdmin(req))) { deny(req, res); return; }

  const [totals] = await db.select({
    total: sql<string>`coalesce(sum(${platformRevenueTable.amount}), 0)::text`,
    count: sql<number>`count(*)::int`,
  }).from(platformRevenueTable);

  const byKind = await db.select({
    kind: platformRevenueTable.kind,
    total: sql<string>`coalesce(sum(${platformRevenueTable.amount}), 0)::text`,
    count: sql<number>`count(*)::int`,
  }).from(platformRevenueTable).groupBy(platformRevenueTable.kind);

  const transactions = await db.select()
    .from(platformRevenueTable)
    .orderBy(desc(platformRevenueTable.createdAt))
    .limit(200);

  const [userStats] = await db.select({ count: sql<number>`count(*)::int` }).from(profilesTable);

  const [loanStats] = await db.select({
    count: sql<number>`count(*)::int`,
    volume: sql<string>`coalesce(sum(${loansTable.principal}), 0)::text`,
    open: sql<number>`count(*) filter (where ${loansTable.status} = 'open')::int`,
    repaying: sql<number>`count(*) filter (where ${loansTable.status} = 'repaying')::int`,
    repaid: sql<number>`count(*) filter (where ${loansTable.status} = 'repaid')::int`,
  }).from(loansTable);

  const [fundingStats] = await db.select({
    uniqueLenders: sql<number>`count(distinct ${fundingsTable.lenderId})::int`,
    totalDeployed: sql<string>`coalesce(sum(${fundingsTable.amount}), 0)::text`,
  }).from(fundingsTable);

  const originationTotal = byKind.find((r) => r.kind === "origination_fee")?.total ?? "0";
  const lateFeeTotal = byKind.find((r) => r.kind === "late_fee")?.total ?? "0";
  const otherTotal = byKind
    .filter((r) => r.kind !== "origination_fee" && r.kind !== "late_fee")
    .reduce((s, r) => s + parseFloat(r.total), 0).toFixed(2);

  res.json({
    revenue: {
      total: parseFloat(totals?.total ?? "0"),
      count: totals?.count ?? 0,
      originationFees: parseFloat(originationTotal),
      lateFees: parseFloat(lateFeeTotal),
      other: parseFloat(otherTotal),
      byKind: byKind.map((r) => ({ kind: r.kind, total: parseFloat(r.total), count: r.count })),
    },
    platform: {
      totalUsers: userStats?.count ?? 0,
      totalLoans: loanStats?.count ?? 0,
      totalVolume: parseFloat(loanStats?.volume ?? "0"),
      openLoans: loanStats?.open ?? 0,
      activeLoans: loanStats?.repaying ?? 0,
      repaidLoans: loanStats?.repaid ?? 0,
      totalDeployed: parseFloat(fundingStats?.totalDeployed ?? "0"),
      uniqueLenders: fundingStats?.uniqueLenders ?? 0,
    },
    transactions: transactions.map((t) => ({
      id: t.id, kind: t.kind, amount: parseFloat(t.amount), loanId: t.loanId, createdAt: t.createdAt,
    })),
  });
});

/* ─── Users ─────────────────────────────────────────────────────────────── */

router.get("/admin/users", async (req: Request, res: Response): Promise<void> => {
  if (!(await isAdmin(req))) { deny(req, res); return; }

  const users = await db.select({
    userId: profilesTable.userId,
    displayName: profilesTable.displayName,
    username: profilesTable.username,
    walletBalance: profilesTable.walletBalance,
    trustScore: profilesTable.trustScore,
    onTimePayments: profilesTable.onTimePayments,
    latePayments: profilesTable.latePayments,
    kycVerifiedAt: profilesTable.kycVerifiedAt,
    ageVerified: profilesTable.ageVerified,
    createdAt: profilesTable.createdAt,
    openLoans: sql<number>`count(distinct case when ${loansTable.status} = 'open' then ${loansTable.id} end)::int`,
    activeLoans: sql<number>`count(distinct case when ${loansTable.status} = 'repaying' then ${loansTable.id} end)::int`,
    totalLoans: sql<number>`count(distinct ${loansTable.id})::int`,
    fundingCount: sql<number>`count(distinct ${fundingsTable.id})::int`,
  })
    .from(profilesTable)
    .leftJoin(loansTable, eq(loansTable.borrowerId, profilesTable.userId))
    .leftJoin(fundingsTable, eq(fundingsTable.lenderId, profilesTable.userId))
    .groupBy(profilesTable.userId)
    .orderBy(desc(profilesTable.createdAt));

  res.json({
    users: users.map((u) => ({
      ...u,
      walletBalance: parseFloat(u.walletBalance),
    })),
  });
});

/* ─── Loans ──────────────────────────────────────────────────────────────── */

router.get("/admin/loans-all", async (req: Request, res: Response): Promise<void> => {
  if (!(await isAdmin(req))) { deny(req, res); return; }

  const { status } = req.query;

  const base = db
    .select({
      id: loansTable.id,
      title: loansTable.title,
      principal: loansTable.principal,
      interestRate: loansTable.interestRate,
      termMonths: loansTable.termMonths,
      monthlyPayment: loansTable.monthlyPayment,
      status: loansTable.status,
      originationFee: loansTable.originationFee,
      createdAt: loansTable.createdAt,
      borrowerName: profilesTable.displayName,
      borrowerUsername: profilesTable.username,
      borrowerId: loansTable.borrowerId,
      fundedAmount: sql<string>`coalesce(sum(${fundingsTable.amount}), 0)::text`,
      funderCount: sql<number>`count(distinct ${fundingsTable.id})::int`,
    })
    .from(loansTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, loansTable.borrowerId))
    .leftJoin(fundingsTable, eq(fundingsTable.loanId, loansTable.id))
    .groupBy(loansTable.id, profilesTable.displayName, profilesTable.username)
    .orderBy(desc(loansTable.createdAt))
    .limit(200);

  const rows = await base;
  const filtered = status && status !== "all"
    ? rows.filter((r) => r.status === status)
    : rows;

  res.json({
    loans: filtered.map((l) => ({
      ...l,
      principal: parseFloat(l.principal),
      interestRate: parseFloat(l.interestRate),
      monthlyPayment: parseFloat(l.monthlyPayment),
      originationFee: parseFloat(l.originationFee),
      fundedAmount: parseFloat(l.fundedAmount),
      fundedPct: parseFloat(l.principal) > 0
        ? Math.min(100, (parseFloat(l.fundedAmount) / parseFloat(l.principal)) * 100)
        : 0,
    })),
  });
});

router.post("/admin/loans/:id/cancel", async (req: Request, res: Response): Promise<void> => {
  if (!(await isAdmin(req))) { deny(req, res); return; }

  const { id } = req.params;
  const [loan] = await db.select().from(loansTable).where(eq(loansTable.id, id));
  if (!loan) { res.status(404).json({ error: "Loan not found" }); return; }
  if (loan.status !== "open") { res.status(400).json({ error: `Cannot cancel a loan with status '${loan.status}'` }); return; }

  await db.update(loansTable).set({ status: "cancelled" }).where(eq(loansTable.id, id));
  res.json({ ok: true });
});

/* ─── Feedback ───────────────────────────────────────────────────────────── */

router.get("/admin/feedback", async (req: Request, res: Response): Promise<void> => {
  if (!(await isAdmin(req))) { deny(req, res); return; }
  const rows = await db.select().from(feedbackTable).orderBy(desc(feedbackTable.createdAt)).limit(200);
  res.json({ feedback: rows });
});

/* ─── Admin user management ──────────────────────────────────────────────── */

router.get("/admin/admins", async (req: Request, res: Response): Promise<void> => {
  if (!(await isAdmin(req))) { deny(req, res); return; }

  const rows = await db
    .select({
      userId: adminUsersTable.userId,
      addedBy: adminUsersTable.addedBy,
      addedAt: adminUsersTable.addedAt,
      displayName: profilesTable.displayName,
      username: profilesTable.username,
    })
    .from(adminUsersTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, adminUsersTable.userId))
    .orderBy(adminUsersTable.addedAt);

  res.json({ admins: rows, ownerUserId: process.env.ADMIN_USER_ID ?? null });
});

router.post("/admin/admins", async (req: Request, res: Response): Promise<void> => {
  if (!isOwner(req)) { deny(req, res); return; }

  const { userId } = req.body;
  if (!userId?.trim()) { res.status(400).json({ error: "userId required" }); return; }
  const targetId = String(userId).trim();

  if (targetId === req.user.id) { res.status(400).json({ error: "You are already the owner" }); return; }

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, targetId));
  if (!profile) { res.status(404).json({ error: "No user found with that ID" }); return; }

  await db.insert(adminUsersTable).values({ userId: targetId, addedBy: req.user.id }).onConflictDoNothing();
  res.status(201).json({ ok: true, displayName: profile.displayName });
});

router.delete("/admin/admins/:userId", async (req: Request, res: Response): Promise<void> => {
  if (!isOwner(req)) { deny(req, res); return; }
  await db.delete(adminUsersTable).where(eq(adminUsersTable.userId, req.params.userId));
  res.json({ ok: true });
});

export default router;
