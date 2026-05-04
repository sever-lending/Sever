import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const profilesTable = pgTable("profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  displayName: varchar("display_name").notNull(),
  bio: text("bio"),
  walletBalance: numeric("wallet_balance", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  trustScore: integer("trust_score").notNull().default(500),
  onTimePayments: integer("on_time_payments").notNull().default(0),
  latePayments: integer("late_payments").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const loansTable = pgTable(
  "loans",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    borrowerId: varchar("borrower_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    title: varchar("title").notNull(),
    description: text("description").notNull(),
    purpose: varchar("purpose").notNull(),
    principal: numeric("principal", { precision: 14, scale: 2 }).notNull(),
    interestRate: numeric("interest_rate", { precision: 6, scale: 3 }).notNull(),
    termMonths: integer("term_months").notNull(),
    fundedAmount: numeric("funded_amount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    originationFee: numeric("origination_fee", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    totalRepayment: numeric("total_repayment", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    monthlyPayment: numeric("monthly_payment", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    status: varchar("status").notNull().default("open"),
    fundedAt: timestamp("funded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("IDX_loans_status").on(table.status),
    index("IDX_loans_borrower").on(table.borrowerId),
  ],
);

export const fundingsTable = pgTable(
  "fundings",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    loanId: varchar("loan_id")
      .notNull()
      .references(() => loansTable.id, { onDelete: "cascade" }),
    lenderId: varchar("lender_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("IDX_fundings_loan").on(table.loanId),
    index("IDX_fundings_lender").on(table.lenderId),
  ],
);

export const installmentsTable = pgTable(
  "installments",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    loanId: varchar("loan_id")
      .notNull()
      .references(() => loansTable.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    lateFee: numeric("late_fee", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    status: varchar("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    index("IDX_installments_loan").on(table.loanId),
    index("IDX_installments_due").on(table.dueDate),
  ],
);

export const activityTable = pgTable(
  "activity",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    loanId: varchar("loan_id"),
    kind: varchar("kind").notNull(),
    message: text("message").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("IDX_activity_user").on(table.userId)],
);

export const platformRevenueTable = pgTable("platform_revenue", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id"),
  kind: varchar("kind").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notificationsTable = pgTable(
  "notifications",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    loanId: varchar("loan_id"),
    kind: varchar("kind").notNull(),
    title: varchar("title").notNull(),
    body: text("body").notNull(),
    read: varchar("read").notNull().default("false"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("IDX_notifications_user").on(table.userId),
    index("IDX_notifications_read").on(table.read),
  ],
);

export type Profile = typeof profilesTable.$inferSelect;
export type Loan = typeof loansTable.$inferSelect;
export type Funding = typeof fundingsTable.$inferSelect;
export type Installment = typeof installmentsTable.$inferSelect;
export type Activity = typeof activityTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
