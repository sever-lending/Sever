export const ORIGINATION_FEE_RATE = 0.015;
export const LATE_FEE_FLAT = 5;
export const LATE_FEE_PCT = 0.02;
export const PLATFORM_LATE_FEE_SHARE = 0.5;

export function calcMonthlyPayment(
  principal: number,
  annualRatePct: number,
  termMonths: number,
): number {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

export function calcOriginationFee(principal: number): number {
  return round2(principal * ORIGINATION_FEE_RATE);
}

export function calcTotalRepayment(monthlyPayment: number, term: number): number {
  return round2(monthlyPayment * term);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function tierFromScore(
  score: number,
): "unverified" | "bronze" | "silver" | "gold" | "platinum" {
  if (score < 300) return "unverified";
  if (score < 500) return "bronze";
  if (score < 700) return "silver";
  if (score < 900) return "gold";
  return "platinum";
}

export function num(value: string | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}
