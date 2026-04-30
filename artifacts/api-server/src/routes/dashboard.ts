import { Router, type IRouter } from "express";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import {
  db,
  loansTable,
  fundingsTable,
  installmentsTable,
  activityTable,
  profilesTable,
} from "@workspace/db";
import {
  GetDashboardOverviewResponse,
  GetPlatformStatsResponse,
  GetRecentActivityResponse,
  GetLenderLeaderboardResponse,
} from "@workspace/api-zod";
import { num, tierFromScore } from "../lib/lending";
import { ensureProfile } from "./profile";

const router: IRouter = Router();

router.get("/dashboard/overview", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const profile = await ensureProfile(userId);

  // Total lent (all-time)
  const [lentAgg] = await db
    .select({
      total: sql<string>`coalesce(sum(${fundingsTable.amount}), 0)::text`,
    })
    .from(fundingsTable)
    .where(eq(fundingsTable.lenderId, userId));

  // Total borrowed (all-time, principal of funded/repaying/repaid loans)
  const [borrowedAgg] = await db
    .select({
      total: sql<string>`coalesce(sum(${loansTable.principal}), 0)::text`,
    })
    .from(loansTable)
    .where(
      and(
        eq(loansTable.borrowerId, userId),
        inArray(loansTable.status, ["repaying", "repaid", "funded"]),
      ),
    );

  // Active lending = sum of fundings on loans currently 'repaying'
  const [activeLendingAgg] = await db
    .select({
      total: sql<string>`coalesce(sum(${fundingsTable.amount}), 0)::text`,
    })
    .from(fundingsTable)
    .innerJoin(loansTable, eq(loansTable.id, fundingsTable.loanId))
    .where(
      and(
        eq(fundingsTable.lenderId, userId),
        eq(loansTable.status, "repaying"),
      ),
    );

  // Active borrowing
  const [activeBorrowingAgg] = await db
    .select({
      total: sql<string>`coalesce(sum(${loansTable.principal}), 0)::text`,
    })
    .from(loansTable)
    .where(
      and(
        eq(loansTable.borrowerId, userId),
        eq(loansTable.status, "repaying"),
      ),
    );

  // Expected returns: sum of (totalRepayment - principal) * sharePct on active loans
  const lendingRows = await db
    .select({
      principal: loansTable.principal,
      totalRepayment: loansTable.totalRepayment,
      interestRate: loansTable.interestRate,
      myAmount: fundingsTable.amount,
    })
    .from(fundingsTable)
    .innerJoin(loansTable, eq(loansTable.id, fundingsTable.loanId))
    .where(
      and(
        eq(fundingsTable.lenderId, userId),
        eq(loansTable.status, "repaying"),
      ),
    );

  let expectedReturns = 0;
  let weightedRate = 0;
  let totalActiveLent = 0;
  for (const row of lendingRows) {
    const p = num(row.principal);
    const tr = num(row.totalRepayment);
    const my = num(row.myAmount);
    if (p > 0) {
      const interest = tr - p;
      expectedReturns += interest * (my / p);
      weightedRate += num(row.interestRate) * my;
      totalActiveLent += my;
    }
  }
  const portfolioYield =
    totalActiveLent > 0 ? weightedRate / totalActiveLent : 0;

  // Upcoming payments (next 8) — both as borrower (you owe) and lender (you receive)
  const owedRows = await db
    .select({
      installmentId: installmentsTable.id,
      loanId: installmentsTable.loanId,
      loanTitle: loansTable.title,
      dueDate: installmentsTable.dueDate,
      amount: installmentsTable.amount,
    })
    .from(installmentsTable)
    .innerJoin(loansTable, eq(loansTable.id, installmentsTable.loanId))
    .where(
      and(
        eq(loansTable.borrowerId, userId),
        eq(installmentsTable.status, "pending"),
      ),
    )
    .orderBy(installmentsTable.dueDate)
    .limit(8);

  const lenderInstallmentRows = await db
    .selectDistinct({
      installmentId: installmentsTable.id,
      loanId: installmentsTable.loanId,
      loanTitle: loansTable.title,
      dueDate: installmentsTable.dueDate,
      amount: installmentsTable.amount,
      myAmount: fundingsTable.amount,
      principal: loansTable.principal,
    })
    .from(installmentsTable)
    .innerJoin(loansTable, eq(loansTable.id, installmentsTable.loanId))
    .innerJoin(
      fundingsTable,
      and(
        eq(fundingsTable.loanId, loansTable.id),
        eq(fundingsTable.lenderId, userId),
      ),
    )
    .where(eq(installmentsTable.status, "pending"))
    .orderBy(installmentsTable.dueDate)
    .limit(8);

  const upcoming: Array<{
    installmentId: string;
    loanId: string;
    loanTitle: string;
    dueDate: string;
    amount: number;
    role: "borrower" | "lender";
  }> = [];
  for (const r of owedRows) {
    upcoming.push({
      installmentId: r.installmentId,
      loanId: r.loanId,
      loanTitle: r.loanTitle,
      dueDate: r.dueDate.toISOString(),
      amount: num(r.amount),
      role: "borrower",
    });
  }
  for (const r of lenderInstallmentRows) {
    const p = num(r.principal);
    const share = p > 0 ? num(r.myAmount) / p : 0;
    upcoming.push({
      installmentId: r.installmentId,
      loanId: r.loanId,
      loanTitle: r.loanTitle,
      dueDate: r.dueDate.toISOString(),
      amount: Math.round(num(r.amount) * share * 100) / 100,
      role: "lender",
    });
  }
  upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  res.json(
    GetDashboardOverviewResponse.parse({
      walletBalance: num(profile.walletBalance),
      totalLent: num(lentAgg?.total ?? 0),
      totalBorrowed: num(borrowedAgg?.total ?? 0),
      activeLending: num(activeLendingAgg?.total ?? 0),
      activeBorrowing: num(activeBorrowingAgg?.total ?? 0),
      expectedReturns: Math.round(expectedReturns * 100) / 100,
      upcomingPayments: upcoming.slice(0, 8),
      portfolioYield: Math.round(portfolioYield * 100) / 100,
      trustScore: profile.trustScore,
    }),
  );
});

router.get("/platform/stats", async (_req, res): Promise<void> => {
  const [volume] = await db
    .select({
      total: sql<string>`coalesce(sum(${loansTable.principal}), 0)::text`,
    })
    .from(loansTable)
    .where(
      inArray(loansTable.status, ["repaying", "repaid", "funded"]),
    );
  const [active] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loansTable)
    .where(eq(loansTable.status, "repaying"));
  const [repaid] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loansTable)
    .where(eq(loansTable.status, "repaid"));
  const [lenders] = await db
    .select({ count: sql<number>`count(distinct ${fundingsTable.lenderId})::int` })
    .from(fundingsTable);
  const [borrowers] = await db
    .select({ count: sql<number>`count(distinct ${loansTable.borrowerId})::int` })
    .from(loansTable);
  const [avgRate] = await db
    .select({
      avg: sql<string>`coalesce(avg(${loansTable.interestRate}), 0)::text`,
    })
    .from(loansTable);

  res.json(
    GetPlatformStatsResponse.parse({
      totalVolume: num(volume?.total ?? 0),
      activeLoans: active?.count ?? 0,
      totalLenders: lenders?.count ?? 0,
      totalBorrowers: borrowers?.count ?? 0,
      averageRate: Math.round(num(avgRate?.avg ?? 0) * 100) / 100,
      repaidLoans: repaid?.count ?? 0,
    }),
  );
});

router.get("/activity/recent", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rows = await db
    .select()
    .from(activityTable)
    .where(eq(activityTable.userId, req.user.id))
    .orderBy(desc(activityTable.createdAt))
    .limit(30);
  res.json(
    GetRecentActivityResponse.parse(
      rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        message: r.message,
        amount: num(r.amount),
        createdAt: r.createdAt.toISOString(),
        loanId: r.loanId,
      })),
    ),
  );
});

router.get("/lenders/leaderboard", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      userId: fundingsTable.lenderId,
      total: sql<string>`coalesce(sum(${fundingsTable.amount}), 0)::text`,
      loansCount: sql<number>`count(distinct ${fundingsTable.loanId})::int`,
      displayName: profilesTable.displayName,
      trustScore: profilesTable.trustScore,
    })
    .from(fundingsTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, fundingsTable.lenderId))
    .groupBy(
      fundingsTable.lenderId,
      profilesTable.displayName,
      profilesTable.trustScore,
    )
    .orderBy(desc(sql`sum(${fundingsTable.amount})`))
    .limit(20);

  res.json(
    GetLenderLeaderboardResponse.parse(
      rows.map((r) => ({
        userId: r.userId,
        displayName: r.displayName ?? "Anonymous",
        totalLent: num(r.total),
        loansFunded: r.loansCount,
        trustScore: r.trustScore ?? 500,
        tier: tierFromScore(r.trustScore ?? 500),
      })),
    ),
  );
});

export default router;
