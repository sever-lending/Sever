import { Router, type IRouter } from "express";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  db,
  loansTable,
  fundingsTable,
  installmentsTable,
  activityTable,
  profilesTable,
  platformRevenueTable,
} from "@workspace/db";
import { notify } from "../lib/notify";
import {
  PayInstallmentParams,
  PayInstallmentResponse,
} from "@workspace/api-zod";
import {
  LATE_FEE_FLAT,
  LATE_FEE_PCT,
  PLATFORM_LATE_FEE_SHARE,
  num,
  round2,
} from "../lib/lending";
import { mapLoanDetail } from "../lib/loan-mapper";

const router: IRouter = Router();

router.post(
  "/repayments/:installmentId/pay",
  async (req, res): Promise<void> => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const params = PayInstallmentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const userId = req.user.id;

    const result = await db.transaction(async (tx) => {
      const [installment] = await tx
        .select()
        .from(installmentsTable)
        .where(eq(installmentsTable.id, params.data.installmentId))
        .for("update");
      if (!installment)
        return { error: "Installment not found", status: 404 as const };
      if (installment.status === "paid")
        return { error: "Installment already paid", status: 400 as const };

      const [loan] = await tx
        .select()
        .from(loansTable)
        .where(eq(loansTable.id, installment.loanId))
        .for("update");
      if (!loan) return { error: "Loan not found", status: 404 as const };
      if (loan.borrowerId !== userId)
        return { error: "Only the borrower can pay", status: 403 as const };

      const now = new Date();
      const isLate = now > installment.dueDate;
      const baseAmount = num(installment.amount);
      const lateFee = isLate
        ? round2(LATE_FEE_FLAT + baseAmount * LATE_FEE_PCT)
        : 0;
      const totalDue = round2(baseAmount + lateFee);

      const [borrowerProfile] = await tx
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, userId))
        .for("update");
      if (!borrowerProfile)
        return { error: "Profile missing", status: 400 as const };
      const balance = num(borrowerProfile.walletBalance);
      if (totalDue > balance)
        return { error: "Insufficient wallet balance", status: 400 as const };

      await tx
        .update(profilesTable)
        .set({
          walletBalance: round2(balance - totalDue).toFixed(2),
          ...(isLate
            ? { latePayments: borrowerProfile.latePayments + 1 }
            : {
                onTimePayments: borrowerProfile.onTimePayments + 1,
                trustScore: Math.min(1000, borrowerProfile.trustScore + 5),
              }),
          ...(isLate
            ? { trustScore: Math.max(0, borrowerProfile.trustScore - 15) }
            : {}),
        })
        .where(eq(profilesTable.userId, userId));

      // Distribute principal to lenders pro-rata
      const fundings = await tx
        .select()
        .from(fundingsTable)
        .where(eq(fundingsTable.loanId, loan.id));
      const totalFunded = fundings.reduce((s, f) => s + num(f.amount), 0) || 1;

      const lateFeeForLenders = round2(lateFee * (1 - PLATFORM_LATE_FEE_SHARE));
      const lateFeeForPlatform = round2(lateFee - lateFeeForLenders);

      let lenderTotalReceived = 0;
      for (const f of fundings) {
        const share = num(f.amount) / totalFunded;
        const principalShare = round2(baseAmount * share);
        const lateShare = round2(lateFeeForLenders * share);
        const total = round2(principalShare + lateShare);
        lenderTotalReceived = round2(lenderTotalReceived + total);

        const [lenderProfile] = await tx
          .select()
          .from(profilesTable)
          .where(eq(profilesTable.userId, f.lenderId))
          .for("update");
        if (lenderProfile) {
          await tx
            .update(profilesTable)
            .set({
              walletBalance: round2(
                num(lenderProfile.walletBalance) + total,
              ).toFixed(2),
            })
            .where(eq(profilesTable.userId, f.lenderId));
        }
        await tx.insert(activityTable).values({
          userId: f.lenderId,
          loanId: loan.id,
          kind: "repayment_received",
          message: `Received installment from "${loan.title}"`,
          amount: total.toFixed(2),
        });
      }

      if (lateFeeForPlatform > 0) {
        await tx.insert(platformRevenueTable).values({
          loanId: loan.id,
          kind: "late_fee",
          amount: lateFeeForPlatform.toFixed(2),
        });
      }

      await tx
        .update(installmentsTable)
        .set({
          status: "paid",
          paidAt: now,
          lateFee: lateFee.toFixed(2),
        })
        .where(eq(installmentsTable.id, installment.id));

      await tx.insert(activityTable).values({
        userId,
        loanId: loan.id,
        kind: "repayment_made",
        message: `Paid installment ${installment.sequence} for "${loan.title}"${
          isLate ? ` (late fee $${lateFee.toFixed(2)})` : ""
        }`,
        amount: totalDue.toFixed(2),
      });

      // Check if loan fully repaid
      const remaining = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(installmentsTable)
        .where(
          and(
            eq(installmentsTable.loanId, loan.id),
            sql`${installmentsTable.status} != 'paid'`,
          ),
        );
      if (remaining[0]?.count === 0) {
        await tx
          .update(loansTable)
          .set({ status: "repaid" })
          .where(eq(loansTable.id, loan.id));
        await tx.insert(activityTable).values({
          userId,
          loanId: loan.id,
          kind: "loan_repaid",
          message: `Loan "${loan.title}" fully repaid`,
          amount: num(loan.principal).toFixed(2),
        });
      }
      return { ok: true as const, loanId: loan.id };
    });

    if ("error" in result) {
      res.status(result.status ?? 500).json({ error: result.error });
      return;
    }

    // Fire notifications best-effort
    try {
      const [paidLoan] = await db
        .select()
        .from(loansTable)
        .where(eq(loansTable.id, result.loanId));
      const paidFundings = await db
        .select({ lenderId: fundingsTable.lenderId, amount: fundingsTable.amount })
        .from(fundingsTable)
        .where(eq(fundingsTable.loanId, result.loanId));
      const totalFunded = paidFundings.reduce((s, f) => {
        const v = parseFloat(f.amount);
        return s + (Number.isFinite(v) ? v : 0);
      }, 0) || 1;
      type N = { userId: string; loanId: string; kind: "repayment_received" | "loan_repaid"; title: string; body: string };
      const notifList: N[] = [];
      for (const f of paidFundings) {
        const share = (parseFloat(f.amount) / totalFunded) * 100;
        notifList.push({
          userId: f.lenderId,
          loanId: result.loanId,
          kind: "repayment_received",
          title: "Repayment received.",
          body: `"${paidLoan?.title}" — your share (${share.toFixed(1)}%) landed in your wallet.`,
        });
      }
      if (paidLoan?.status === "repaid") {
        notifList.push({
          userId: userId,
          loanId: result.loanId,
          kind: "loan_repaid",
          title: "Loan fully repaid.",
          body: `Congratulations — "${paidLoan.title}" is completely paid off.`,
        });
      }
      await notify(notifList);
    } catch {
      // non-blocking
    }

    const [loan] = await db
      .select()
      .from(loansTable)
      .where(eq(loansTable.id, result.loanId));
    const [borrower] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, loan!.borrowerId));
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
        name: borrower?.displayName ?? "Unknown",
        trustScore: borrower?.trustScore ?? 500,
        bio: borrower?.bio ?? null,
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
    res.json(PayInstallmentResponse.parse(detail));
  },
);

export default router;
