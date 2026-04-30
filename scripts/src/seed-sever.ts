import {
  db,
  usersTable,
  profilesTable,
  loansTable,
  fundingsTable,
  activityTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

function calcMonthly(p: number, ratePct: number, n: number): number {
  const r = ratePct / 100 / 12;
  if (r === 0) return p / n;
  return (p * r) / (1 - Math.pow(1 + r, -n));
}
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

const SEED_USERS = [
  {
    id: "seed_maya_1",
    email: "maya@sever.demo",
    firstName: "Maya",
    lastName: "Okafor",
    bio: "Building a small bakery in Brooklyn. 7 years of restaurant management.",
    walletBalance: 250,
    trustScore: 720,
    onTime: 18,
    late: 1,
  },
  {
    id: "seed_dev_2",
    email: "dev@sever.demo",
    firstName: "Devon",
    lastName: "Park",
    bio: "Full-stack engineer transitioning into freelance work.",
    walletBalance: 5400,
    trustScore: 680,
    onTime: 12,
    late: 0,
  },
  {
    id: "seed_sara_3",
    email: "sara@sever.demo",
    firstName: "Sara",
    lastName: "Lindqvist",
    bio: "Diversifying outside of public markets. Lender since day one.",
    walletBalance: 38000,
    trustScore: 910,
    onTime: 42,
    late: 0,
  },
  {
    id: "seed_marc_4",
    email: "marc@sever.demo",
    firstName: "Marcus",
    lastName: "Bell",
    bio: "Returning lender. I bet on people, not paperwork.",
    walletBalance: 21500,
    trustScore: 850,
    onTime: 27,
    late: 1,
  },
  {
    id: "seed_priya_5",
    email: "priya@sever.demo",
    firstName: "Priya",
    lastName: "Sharma",
    bio: "Refinancing high-interest credit-card debt. Steady W-2 income.",
    walletBalance: 800,
    trustScore: 640,
    onTime: 9,
    late: 0,
  },
];

const SEED_LOANS = [
  {
    borrowerId: "seed_maya_1",
    title: "Espresso machine + summer storefront pop-up",
    description:
      "I've been running a Saturday market stall for 18 months and turning a steady profit. This loan funds a commercial espresso machine and a 3-month pop-up at a vacant storefront. Repayments come from documented daily sales.",
    purpose: "business",
    principal: 4500,
    interestRate: 9.5,
    termMonths: 18,
  },
  {
    borrowerId: "seed_priya_5",
    title: "Consolidate two credit-card balances",
    description:
      "Combining a 23.99% APR card and an 18% APR card into one fixed payment. Verified income $74k/yr. Already on a strict budget — this just lowers my interest cost.",
    purpose: "debt-consolidation",
    principal: 8200,
    interestRate: 11.25,
    termMonths: 24,
  },
  {
    borrowerId: "seed_dev_2",
    title: "Replace failing HVAC before winter",
    description:
      "Furnace finally died. Three quotes attached. Need to move quickly before temperatures drop. Will repay over 3 years from steady contracting income.",
    purpose: "home-improvement",
    principal: 6700,
    interestRate: 8.75,
    termMonths: 36,
  },
  {
    borrowerId: "seed_maya_1",
    title: "Used Toyota for delivery routes",
    description:
      "Need a reliable used vehicle to expand my catering side of the business. Pre-purchase inspection done; financing only the remainder above my $2k down.",
    purpose: "vehicle",
    principal: 9800,
    interestRate: 10.0,
    termMonths: 48,
  },
  {
    borrowerId: "seed_priya_5",
    title: "Emergency dental work",
    description:
      "Crown + root canal not covered by my plan. Quote from in-network specialist attached. Will repay over 12 months.",
    purpose: "medical",
    principal: 2400,
    interestRate: 12.5,
    termMonths: 12,
  },
];

async function main() {
  console.log("Seeding Sever demo data...");

  for (const u of SEED_USERS) {
    await db
      .insert(usersTable)
      .values({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
      })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: { email: u.email, firstName: u.firstName, lastName: u.lastName },
      });

    await db
      .insert(profilesTable)
      .values({
        userId: u.id,
        displayName: `${u.firstName} ${u.lastName}`,
        bio: u.bio,
        walletBalance: u.walletBalance.toFixed(2),
        trustScore: u.trustScore,
        onTimePayments: u.onTime,
        latePayments: u.late,
      })
      .onConflictDoUpdate({
        target: profilesTable.userId,
        set: {
          displayName: `${u.firstName} ${u.lastName}`,
          bio: u.bio,
          walletBalance: u.walletBalance.toFixed(2),
          trustScore: u.trustScore,
          onTimePayments: u.onTime,
          latePayments: u.late,
        },
      });
  }

  // Wipe existing seeded loans / fundings / activity
  await db.execute(sql`DELETE FROM activity WHERE user_id LIKE 'seed_%'`);
  await db.execute(
    sql`DELETE FROM fundings WHERE lender_id LIKE 'seed_%' OR loan_id IN (SELECT id FROM loans WHERE borrower_id LIKE 'seed_%')`,
  );
  await db.execute(sql`DELETE FROM loans WHERE borrower_id LIKE 'seed_%'`);

  for (const loan of SEED_LOANS) {
    const monthly = r2(
      calcMonthly(loan.principal, loan.interestRate, loan.termMonths),
    );
    const total = r2(monthly * loan.termMonths);
    const fee = r2(loan.principal * 0.015);
    const [created] = await db
      .insert(loansTable)
      .values({
        borrowerId: loan.borrowerId,
        title: loan.title,
        description: loan.description,
        purpose: loan.purpose,
        principal: loan.principal.toFixed(2),
        interestRate: loan.interestRate.toFixed(3),
        termMonths: loan.termMonths,
        monthlyPayment: monthly.toFixed(2),
        totalRepayment: total.toFixed(2),
        originationFee: fee.toFixed(2),
        status: "open",
      })
      .returning();

    await db.insert(activityTable).values({
      userId: loan.borrowerId,
      loanId: created.id,
      kind: "loan_created",
      message: `Posted loan request "${loan.title}"`,
      amount: loan.principal.toFixed(2),
    });
  }

  // Add partial fundings to two loans so progress bars look alive
  const openLoans = await db.select().from(loansTable);
  const sara = "seed_sara_3";
  const marc = "seed_marc_4";
  if (openLoans.length >= 2) {
    const l1 = openLoans[0];
    const l2 = openLoans[1];
    await db.insert(fundingsTable).values({
      loanId: l1.id,
      lenderId: sara,
      amount: "1500.00",
    });
    await db
      .update(loansTable)
      .set({ fundedAmount: "1500.00" })
      .where(sql`${loansTable.id} = ${l1.id}`);

    await db.insert(fundingsTable).values({
      loanId: l2.id,
      lenderId: marc,
      amount: "3000.00",
    });
    await db.insert(fundingsTable).values({
      loanId: l2.id,
      lenderId: sara,
      amount: "2500.00",
    });
    await db
      .update(loansTable)
      .set({ fundedAmount: "5500.00" })
      .where(sql`${loansTable.id} = ${l2.id}`);

    await db.insert(activityTable).values([
      {
        userId: sara,
        loanId: l1.id,
        kind: "loan_funded",
        message: `Funded "${l1.title}"`,
        amount: "1500.00",
      },
      {
        userId: marc,
        loanId: l2.id,
        kind: "loan_funded",
        message: `Funded "${l2.title}"`,
        amount: "3000.00",
      },
      {
        userId: sara,
        loanId: l2.id,
        kind: "loan_funded",
        message: `Funded "${l2.title}"`,
        amount: "2500.00",
      },
    ]);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
