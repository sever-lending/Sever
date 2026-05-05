# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Sever — P2P Lending App

A peer-to-peer lending platform ("Your money. Your terms. No banks.") with a dark teal/mint aesthetic.

### Artifacts
- `artifacts/sever` (web, React+Vite, port 22285, served at `/`)
- `artifacts/api-server` (Express 5, port 8080, served at `/api`)

### Auth
- Replit Auth (OIDC) via `lib/replit-auth-web` and `artifacts/api-server/src/lib/auth.ts` + `middlewares/authMiddleware.ts`. Profile rows are auto-created on first authenticated request via `ensureProfile()`.

### Domain model (`lib/db/src/schema/lending.ts`)
- `profiles` — wallet balance, trust score (0-1000), tier (unverified→platinum), on-time/late counts.
- `loans` — borrower posts request; status: open → repaying → repaid (or cancelled / defaulted).
- `fundings` — partial-funding by lenders; loan transitions to `repaying` when fully funded.
- `installments` — monthly repayment schedule generated on full funding.
- `activity` — per-user feed of platform events.
- `platform_revenue` — owner-side ledger of platform earnings.

### Monetization
- 1.5% origination fee deducted from disbursement on full funding (`platform_revenue.kind = 'origination_fee'`).
- Late fee on overdue installments: $5 + 2% of installment; platform keeps 50%, lenders get 50% pro-rata (`kind = 'late_fee'`). Math constants live in `artifacts/api-server/src/lib/lending.ts`.

### Demo data
- `pnpm --filter @workspace/scripts run seed-sever` — re-seeds 5 demo users (3 borrowers, 2 lenders) and 5 open loans, with two partially funded.

### Admin Panel
- Visit `/admin-login` and sign in with the owner Replit account → unlocks `/admin` dashboard.
- Admin access requires an authenticated session with a user ID matching the `ADMIN_USER_ID` environment variable.

### Legal Pages
- `/legal/terms` — Terms of Service
- `/legal/privacy` — Privacy Policy
- `/legal/disclaimer` — Risk Disclaimer & Waiver
- `/legal/contract` — Loan Agreement template

### KYC
- `/kyc` — 4-step identity verification UI (personal info → ID upload → selfie → review). Needs real provider integration (e.g. Persona, Stripe Identity) for production.

### Stripe Payments
- Connected via Replit Stripe integration (sandbox mode in dev, live in production).
- Client helper: `artifacts/api-server/src/lib/stripeClient.ts`
- `POST /api/stripe/checkout-session` — creates a Stripe Checkout session for wallet deposits; returns `{url}`.
- `POST /api/stripe/confirm-deposit` — verifies session, idempotently credits wallet.
- Wallet page redirects users to Stripe Checkout; on return, auto-confirms and credits balance.

### Loan Agreement Modal
- `LoanAgreementModal` component — shown before a lender funds a loan. Requires 3 checkboxes (risk, terms, KYC) before allowing the transaction to proceed.
