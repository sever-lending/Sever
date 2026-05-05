import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  platformRevenueTable,
  profilesTable,
  loansTable,
  fundingsTable,
} from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router: IRouter = Router();

function isAdmin(req: Request): boolean {
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!adminUserId) return false;
  return req.isAuthenticated() && req.user.id === adminUserId;
}

router.post("/admin/verify", (req, res): void => {
  if (isAdmin(req)) {
    res.json({ ok: true });
  } else if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
});

router.get("/admin/revenue", async (req: Request, res: Response): Promise<void> => {
  if (!isAdmin(req)) {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Authentication required" });
    } else {
      res.status(403).json({ error: "Forbidden" });
    }
    return;
  }

  const [totals] = await db
    .select({
      total: sql<string>`coalesce(sum(${platformRevenueTable.amount}), 0)::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(platformRevenueTable);

  const byKind = await db
    .select({
      kind: platformRevenueTable.kind,
      total: sql<string>`coalesce(sum(${platformRevenueTable.amount}), 0)::text`,
      count: sql<number>`count(*)::int`,
    })
    .from(platformRevenueTable)
    .groupBy(platformRevenueTable.kind);

  const transactions = await db
    .select()
    .from(platformRevenueTable)
    .orderBy(desc(platformRevenueTable.createdAt))
    .limit(100);

  const [userStats] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(profilesTable);

  const [loanStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      volume: sql<string>`coalesce(sum(${loansTable.principal}), 0)::text`,
      open: sql<number>`count(*) filter (where ${loansTable.status} = 'open')::int`,
      repaying: sql<number>`count(*) filter (where ${loansTable.status} = 'repaying')::int`,
      repaid: sql<number>`count(*) filter (where ${loansTable.status} = 'repaid')::int`,
    })
    .from(loansTable);

  const [fundingStats] = await db
    .select({
      uniqueLenders: sql<number>`count(distinct ${fundingsTable.lenderId})::int`,
      totalDeployed: sql<string>`coalesce(sum(${fundingsTable.amount}), 0)::text`,
    })
    .from(fundingsTable);

  const originationTotal =
    byKind.find((r) => r.kind === "origination_fee")?.total ?? "0";
  const lateFeeTotal =
    byKind.find((r) => r.kind === "late_fee")?.total ?? "0";
  const otherTotal = byKind
    .filter((r) => r.kind !== "origination_fee" && r.kind !== "late_fee")
    .reduce((s, r) => s + parseFloat(r.total), 0)
    .toFixed(2);

  res.json({
    revenue: {
      total: parseFloat(totals?.total ?? "0"),
      count: totals?.count ?? 0,
      originationFees: parseFloat(originationTotal),
      lateFees: parseFloat(lateFeeTotal),
      other: parseFloat(otherTotal),
      byKind: byKind.map((r) => ({
        kind: r.kind,
        total: parseFloat(r.total),
        count: r.count,
      })),
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
      id: t.id,
      kind: t.kind,
      amount: parseFloat(t.amount),
      loanId: t.loanId,
      createdAt: t.createdAt,
    })),
  });
});

export default router;
