import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import {
  db,
  loansTable,
  fundingsTable,
  installmentsTable,
  activityTable,
  profilesTable,
  platformRevenueTable,
  usersTable,
} from "@workspace/db";
import {
  ListLoansResponse,
  GetLoanParams,
  GetLoanResponse,
  CreateLoanRequestBody,
  CreateLoanRequestResponse,
  FundLoanParams,
  FundLoanBody,
  FundLoanResponse,
  CancelLoanParams,
  CancelLoanResponse,
  ListMyBorrowingsResponse,
  ListMyLendingsResponse,
} from "@workspace/api-zod";
import {
  calcMonthlyPayment,
  calcOriginationFee,
  calcTotalRepayment,
  num,
  round2,
} from "../lib/lending";
import { mapLoanDetail, mapLoanSummary } from "../lib/loan-mapper";
import { ensureProfile } from "./profile";
import { notify } from "../lib/notify";

const router: IRouter = Router();

interface BorrowerJoinRow {
  loan: typeof loansTable.$inferSelect;
  displayName: string;
  trustScore: number;
  bio: string | null;
}

async function loadBorrowers(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { name: string; trustScore: number; bio: string | null }>();
  const rows = await db
    .select({
      userId: profilesTable.userId,
      displayName: profilesTable.displayName,
      trustScore: profilesTable.trustScore,
      bio: profilesTable.bio,
    })
    .from(profilesTable)
    .where(inArray(profilesTable.userId, userIds));
  const map = new Map<string, { name: string; trustScore: number; bio: string | null }>();
  for (const r of rows) {
    map.set(r.userId, { name: r.displayName, trustScore: r.trustScore, bio: r.bio });
  }
  return map;
}

router.get("/loans", async (req, res): Promise<void> => {
  const status = typeof req.query.status === "string" ? req.query.status : "open";
  const minRate = req.query.minRate ? Number(req.query.minRate) : undefined;
  const maxRate = req.query.maxRate ? Number(req.query.maxRate) : undefined;
  const purpose = typeof req.query.purpose === "string" ? req.query.purpose : undefined;

  const conds = [];
  if (status !== "all") conds.push(eq(loansTable.status, status));
  if (minRate != null) conds.push(gte(loansTable.interestRate, String(minRate)));
  if (maxRate != null) conds.push(lte(loansTable.interestRate, String(maxRate)));
  if (purpose) conds.push(eq(loansTable.purpose, purpose));

  const loans = await db
    .select()
    .from(loansTable)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(loansTable.createdAt))
    .limit(100);

  const borrowers = await loadBorrowers(loans.map((l) => l.borrowerId));
  const items = loans.map((l) =>
    mapLoanSummary(l, {
      id: l.borrowerId,
      name: borrowers.get(l.borrowerId)?.name ?? "Unknown",
      trustScore: borrowers.get(l.borrowerId)?.trustScore ?? 500,
      bio: null,
    }),
  );
  res.json(ListLoansResponse.parse(items));
});

router.get("/loans/mine/borrowing", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const loans = await db
    .select()
    .from(loansTable)
    .where(eq(loansTable.borrowerId, req.user.id))
    .orderBy(desc(loansTable.createdAt));
  const borrowers = await loadBorrowers([req.user.id]);
  const items = loans.map((l) =>
    mapLoanSummary(l, {
      id: l.borrowerId,
      name: borrowers.get(l.borrowerId)?.name ?? "You",
      trustScore: borrowers.get(l.borrowerId)?.trustScore ?? 500,
      bio: null,
    }),
  );
  res.json(ListMyBorrowingsResponse.parse(items));
});

router.get("/loans/mine/lending", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const loanIdsRows = await db
    .selectDistinct({ loanId: fundingsTable.loanId })
    .from(fundingsTable)
    .where(eq(fundingsTable.lenderId, req.user.id));
  const ids = loanIdsRows.map((r) => r.loanId);
  if (ids.length === 0) {
    res.json([]);
    return;
  }
  const loans = await db
    .select()
    .from(loansTable)
    .where(inArray(loansTable.id, ids))
    .orderBy(desc(loansTable.createdAt));
  const borrowers = await loadBorrowers(loans.map((l) => l.borrowerId));
  const items = loans.map((l) =>
    mapLoanSummary(l, {
      id: l.borrowerId,
      name: borrowers.get(l.borrowerId)?.name ?? "Unknown",
      trustScore: borrowers.get(l.borrowerId)?.trustScore ?? 500,
      bio: null,
    }),
  );
  res.json(ListMyLendingsResponse.parse(items));
});

router.get("/loans/:id", async (req, res): Promise<void> => {
  const params = GetLoanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [loan] = await db
    .select()
    .from(loansTable)
    .where(eq(loansTable.id, params.data.id));
  if (!loan) {
    res.status(404).json({ error: "Loan not found" });
    return;
  }
  const borrowers = await loadBorrowers([loan.borrowerId]);
  const b = borrowers.get(loan.borrowerId);

  const fundings = await db
    .select({
      id: fundingsTable.id,
      loanId: fundingsTable.loanId,
      lenderId: fundingsTable.lenderId,
      amount: fundingsTable.amount,
      createdAt: fundingsTable.createdAt,
      lenderName: profilesTable.displayName,
    })
    .from(fundingsTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, fundingsTable.lenderId))
    .where(eq(fundingsTable.loanId, loan.id))
    .orderBy(asc(fundingsTable.createdAt));

  const schedule = await db
    .select()
    .from(installmentsTable)
    .where(eq(installmentsTable.loanId, loan.id))
    .orderBy(asc(installmentsTable.sequence));

  const detail = mapLoanDetail(
    loan,
    {
      id: loan.borrowerId,
      name: b?.name ?? "Unknown",
      trustScore: b?.trustScore ?? 500,
      bio: b?.bio ?? null,
    },
    fundings.map((f) => ({
      id: f.id,
      loanId: f.loanId,
      lenderId: f.lenderId,
      amount: f.amount,
      createdAt: f.createdAt,
      lenderName: f.lenderName ?? "Anonymous",
    })),
    schedule,
  );
  res.json(GetLoanResponse.parse(detail));
});

router.post("/loans", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = CreateLoanRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await ensureProfile(req.user.id);
  const { title, principal, interestRate, termMonths, purpose, description } =
    parsed.data;
  const monthlyPayment = round2(
    calcMonthlyPayment(principal, interestRate, termMonths),
  );
  const totalRepayment = calcTotalRepayment(monthlyPayment, termMonths);
  const originationFee = calcOriginationFee(principal);

  const [loan] = await db
    .insert(loansTable)
    .values({
      borrowerId: req.user.id,
      title,
      description,
      purpose,
      principal: principal.toFixed(2),
      interestRate: interestRate.toFixed(3),
      termMonths,
      monthlyPayment: monthlyPayment.toFixed(2),
      totalRepayment: totalRepayment.toFixed(2),
      originationFee: originationFee.toFixed(2),
      status: "open",
    })
    .returning();

  await db.insert(activityTable).values({
    userId: req.user.id,
    loanId: loan.id,
    kind: "loan_created",
    message: `Posted loan request "${title}"`,
    amount: principal.toFixed(2),
  });

  const borrowers = await loadBorrowers([loan.borrowerId]);
  const b = borrowers.get(loan.borrowerId);
  const detail = mapLoanDetail(
    loan,
    {
      id: loan.borrowerId,
      name: b?.name ?? "Unknown",
      trustScore: b?.trustScore ?? 500,
      bio: b?.bio ?? null,
    },
    [],
    [],
  );
  res.status(201).json(CreateLoanRequestResponse.parse(detail));
});

router.post("/loans/:id/fund", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = FundLoanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = FundLoanBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const lenderId = req.user.id;
  await ensureProfile(lenderId);

  const result = await db.transaction(async (tx) => {
    const [loan] = await tx
      .select()
      .from(loansTable)
      .where(eq(loansTable.id, params.data.id))
      .for("update");
    if (!loan) return { error: "Loan not found", status: 404 as const };
    if (loan.status !== "open")
      return { error: "Loan is not open for funding", status: 400 as const };
    if (loan.borrowerId === lenderId)
      return { error: "You cannot fund your own loan", status: 400 as const };

    const principal = num(loan.principal);
    const funded = num(loan.fundedAmount);
    const remaining = round2(principal - funded);
    const amount = round2(Math.min(body.data.amount, remaining));
    if (amount <= 0)
      return { error: "Loan is already fully funded", status: 400 as const };

    const [lenderProfile] = await tx
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, lenderId))
      .for("update");
    if (!lenderProfile)
      return { error: "Lender profile missing", status: 400 as const };
    const lenderBalance = num(lenderProfile.walletBalance);
    if (amount > lenderBalance)
      return { error: "Insufficient wallet balance", status: 400 as const };

    await tx
      .update(profilesTable)
      .set({ walletBalance: round2(lenderBalance - amount).toFixed(2) })
      .where(eq(profilesTable.userId, lenderId));

    await tx.insert(fundingsTable).values({
      loanId: loan.id,
      lenderId,
      amount: amount.toFixed(2),
    });

    const newFunded = round2(funded + amount);
    const fullyFunded = newFunded >= principal - 0.005;

    await tx
      .update(loansTable)
      .set({
        fundedAmount: newFunded.toFixed(2),
        status: fullyFunded ? "repaying" : "open",
        fundedAt: fullyFunded ? new Date() : null,
      })
      .where(eq(loansTable.id, loan.id));

    await tx.insert(activityTable).values({
      userId: lenderId,
      loanId: loan.id,
      kind: "loan_funded",
      message: `Funded "${loan.title}"`,
      amount: amount.toFixed(2),
    });

    if (fullyFunded) {
      const fee = num(loan.originationFee);
      const disbursement = round2(principal - fee);

      const [borrowerProfile] = await tx
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, loan.borrowerId))
        .for("update");
      if (borrowerProfile) {
        const newBorrowerBalance = round2(
          num(borrowerProfile.walletBalance) + disbursement,
        );
        await tx
          .update(profilesTable)
          .set({ walletBalance: newBorrowerBalance.toFixed(2) })
          .where(eq(profilesTable.userId, loan.borrowerId));
      }

      await tx.insert(platformRevenueTable).values({
        loanId: loan.id,
        kind: "origination_fee",
        amount: fee.toFixed(2),
      });

      const monthlyAmount = num(loan.monthlyPayment);
      const installmentRows = [];
      const baseDate = new Date();
      for (let i = 1; i <= loan.termMonths; i++) {
        const due = new Date(baseDate);
        due.setMonth(due.getMonth() + i);
        installmentRows.push({
          loanId: loan.id,
          sequence: i,
          dueDate: due,
          amount: monthlyAmount.toFixed(2),
          status: "pending",
        });
      }
      await tx.insert(installmentsTable).values(installmentRows);

      await tx.insert(activityTable).values({
        userId: loan.borrowerId,
        loanId: loan.id,
        kind: "loan_fully_funded",
        message: `Loan "${loan.title}" fully funded — $${disbursement.toFixed(2)} disbursed (after $${fee.toFixed(2)} origination fee)`,
        amount: disbursement.toFixed(2),
      });
    }
    return { ok: true as const };
  });

  if ("error" in result) {
    res.status(result.status ?? 500).json({ error: result.error });
    return;
  }

  // Re-read for response
  const [loan] = await db
    .select()
    .from(loansTable)
    .where(eq(loansTable.id, params.data.id));
  const borrowers = await loadBorrowers([loan!.borrowerId]);

  // Fire notifications (best-effort, outside tx)
  try {
    type N = { userId: string; loanId: string; kind: "loan_funded" | "loan_fully_funded"; title: string; body: string };
    const notifList: N[] = [];
    notifList.push({
      userId: lenderId,
      loanId: loan!.id,
      kind: "loan_funded",
      title: "Funding confirmed.",
      body: `Your contribution to "${loan!.title}" has been recorded.`,
    });
    if (loan!.status === "repaying") {
      notifList.push({
        userId: loan!.borrowerId,
        loanId: loan!.id,
        kind: "loan_fully_funded",
        title: "Loan fully funded.",
        body: `"${loan!.title}" reached its target. Funds have been disbursed to your wallet.`,
      });
      const allFundings = await db
        .select({ lenderId: fundingsTable.lenderId })
        .from(fundingsTable)
        .where(eq(fundingsTable.loanId, loan!.id));
      for (const f of allFundings) {
        if (f.lenderId !== lenderId) {
          notifList.push({
            userId: f.lenderId,
            loanId: loan!.id,
            kind: "loan_fully_funded",
            title: "Loan fully funded.",
            body: `"${loan!.title}" is now fully funded and repayments will begin.`,
          });
        }
      }
    }
    await notify(notifList);
  } catch {
    // non-blocking
  }

  const b = borrowers.get(loan!.borrowerId);

  const fundings = await db
    .select({
      id: fundingsTable.id,
      loanId: fundingsTable.loanId,
      lenderId: fundingsTable.lenderId,
      amount: fundingsTable.amount,
      createdAt: fundingsTable.createdAt,
      lenderName: profilesTable.displayName,
    })
    .from(fundingsTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, fundingsTable.lenderId))
    .where(eq(fundingsTable.loanId, loan!.id));
  const schedule = await db
    .select()
    .from(installmentsTable)
    .where(eq(installmentsTable.loanId, loan!.id))
    .orderBy(asc(installmentsTable.sequence));
  const detail = mapLoanDetail(
    loan!,
    {
      id: loan!.borrowerId,
      name: b?.name ?? "Unknown",
      trustScore: b?.trustScore ?? 500,
      bio: b?.bio ?? null,
    },
    fundings.map((f) => ({
      id: f.id,
      loanId: f.loanId,
      lenderId: f.lenderId,
      amount: f.amount,
      createdAt: f.createdAt,
      lenderName: f.lenderName ?? "Anonymous",
    })),
    schedule,
  );
  res.json(FundLoanResponse.parse(detail));
});

router.post("/loans/:id/cancel", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = CancelLoanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.user.id;

  const result = await db.transaction(async (tx) => {
    const [loan] = await tx
      .select()
      .from(loansTable)
      .where(eq(loansTable.id, params.data.id))
      .for("update");
    if (!loan) return { error: "Loan not found", status: 404 as const };
    if (loan.borrowerId !== userId)
      return { error: "Only the borrower can cancel", status: 403 as const };
    if (loan.status !== "open")
      return { error: "Only open loans can be cancelled", status: 400 as const };

    // Refund lenders
    const fundings = await tx
      .select()
      .from(fundingsTable)
      .where(eq(fundingsTable.loanId, loan.id));
    for (const f of fundings) {
      const [lenderProfile] = await tx
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, f.lenderId))
        .for("update");
      if (lenderProfile) {
        const newBal = round2(num(lenderProfile.walletBalance) + num(f.amount));
        await tx
          .update(profilesTable)
          .set({ walletBalance: newBal.toFixed(2) })
          .where(eq(profilesTable.userId, f.lenderId));
      }
    }
    await tx
      .update(loansTable)
      .set({ status: "cancelled", fundedAmount: "0" })
      .where(eq(loansTable.id, loan.id));
    await tx.delete(fundingsTable).where(eq(fundingsTable.loanId, loan.id));
    return { ok: true as const };
  });

  if ("error" in result) {
    res.status(result.status ?? 500).json({ error: result.error });
    return;
  }

  const [loan] = await db
    .select()
    .from(loansTable)
    .where(eq(loansTable.id, params.data.id));
  const borrowers = await loadBorrowers([loan!.borrowerId]);
  const b = borrowers.get(loan!.borrowerId);
  const detail = mapLoanDetail(
    loan!,
    {
      id: loan!.borrowerId,
      name: b?.name ?? "Unknown",
      trustScore: b?.trustScore ?? 500,
      bio: b?.bio ?? null,
    },
    [],
    [],
  );
  res.json(CancelLoanResponse.parse(detail));
});

export default router;
