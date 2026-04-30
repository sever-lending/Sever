import { num, tierFromScore } from "./lending";
import type { Loan, Funding, Installment } from "@workspace/db";

export interface BorrowerInfo {
  id: string;
  name: string;
  trustScore: number;
  bio: string | null;
}

export function mapLoanSummary(loan: Loan, borrower: BorrowerInfo) {
  return {
    id: loan.id,
    borrowerId: loan.borrowerId,
    borrowerName: borrower.name,
    borrowerTrustScore: borrower.trustScore,
    borrowerTier: tierFromScore(borrower.trustScore),
    principal: num(loan.principal),
    fundedAmount: num(loan.fundedAmount),
    interestRate: num(loan.interestRate),
    termMonths: loan.termMonths,
    purpose: loan.purpose,
    title: loan.title,
    status: loan.status,
    createdAt: loan.createdAt.toISOString(),
  };
}

export function mapLoanDetail(
  loan: Loan,
  borrower: BorrowerInfo,
  fundings: Array<Funding & { lenderName: string }>,
  schedule: Installment[],
) {
  const principal = num(loan.principal);
  return {
    id: loan.id,
    borrowerId: loan.borrowerId,
    borrowerName: borrower.name,
    borrowerTrustScore: borrower.trustScore,
    borrowerTier: tierFromScore(borrower.trustScore),
    borrowerBio: borrower.bio,
    principal,
    fundedAmount: num(loan.fundedAmount),
    interestRate: num(loan.interestRate),
    termMonths: loan.termMonths,
    purpose: loan.purpose,
    title: loan.title,
    description: loan.description,
    status: loan.status,
    createdAt: loan.createdAt.toISOString(),
    originationFee: num(loan.originationFee),
    totalRepayment: num(loan.totalRepayment),
    monthlyPayment: num(loan.monthlyPayment),
    fundings: fundings.map((f) => ({
      id: f.id,
      lenderId: f.lenderId,
      lenderName: f.lenderName,
      amount: num(f.amount),
      sharePct: principal > 0 ? (num(f.amount) / principal) * 100 : 0,
      createdAt: f.createdAt.toISOString(),
    })),
    schedule: schedule.map((i) => ({
      id: i.id,
      dueDate: i.dueDate.toISOString(),
      amount: num(i.amount),
      status: i.status,
      paidAt: i.paidAt ? i.paidAt.toISOString() : null,
      lateFee: num(i.lateFee),
    })),
  };
}
