# Threat Model

## Project Overview

Sever is a peer-to-peer lending platform built as a pnpm monorepo with a React+Vite web frontend (`artifacts/sever`), an Express 5 API (`artifacts/api-server`), PostgreSQL via Drizzle (`lib/db`), Replit Auth (OIDC), and Stripe for wallet deposits, identity verification, and connected-account payouts. The main production web deployment serves the frontend at `/` and the API at `/api`; `artifacts/mockup-sandbox` is development-only and should be ignored unless separately exposed. The mobile app (`artifacts/sever-mobile`) consumes the same API and auth flows when deployed, so shared API/auth logic remains in scope.

## Assets

- **User accounts and sessions** — Replit-authenticated user identities, session IDs, bearer tokens for mobile, and refresh tokens stored in session state. Compromise enables account takeover and unauthorized financial actions.
- **Wallet balances and lending ledger data** — profile balances, loans, fundings, installments, activity, and platform revenue. Integrity matters because balance tampering or improper disbursement directly affects money movement.
- **Stripe-linked payment capabilities** — checkout sessions, identity verification sessions, and Stripe Connect destination accounts. Abuse could convert internal balance manipulation into external cash-out.
- **Administrative data and controls** — platform revenue metrics and any privileged owner-only functionality. Exposure can leak business-sensitive information and widen the blast radius for future admin actions.
- **Application secrets** — `ADMIN_KEY`, database credentials, Replit identity tokens, and Stripe connector secrets. Disclosure can bypass access controls or allow direct third-party API abuse.

## Trust Boundaries

- **Browser/mobile client to API** — all client input is untrusted; every state-changing API route must authenticate, authorize, and validate server-side.
- **API to PostgreSQL** — the API can mutate balances, loans, and sessions directly; application-layer logic flaws can become persistent financial fraud.
- **API to Stripe** — the backend uses privileged Stripe credentials for checkout, identity, and payouts; server-side checks must prevent users from converting internal state bugs into real transfers.
- **Unauthenticated to authenticated surfaces** — public marketplace and auth routes coexist with authenticated wallet, lending, and repayment actions.
- **Regular user to admin surface** — `/api/admin/*` must be protected separately from normal authenticated users, and admin secrets must never be exposed client-side or in versioned files.
- **Production vs dev-only code** — `artifacts/mockup-sandbox`, local scripts, and local-only tooling are generally out of scope unless production reachability is demonstrated. Assume `NODE_ENV=production` in deployed API/web services.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/*.ts`, `artifacts/sever/src/App.tsx`
- **Highest-risk code areas:** wallet/payment routes (`profile.ts`, `stripe.ts`, `connect.ts`), lending and repayment logic (`loans.ts`, `repayments.ts`), auth/session handling (`lib/auth.ts`, `middlewares/authMiddleware.ts`, `routes/auth.ts`), and admin access (`routes/admin.ts`)
- **Public surfaces:** `/api/login`, `/api/callback`, `/api/auth/user`, `/api/loans`, `/api/loans/:id`, public dashboard stats, and admin key verification endpoints
- **Authenticated surfaces:** wallet/profile, funding, repayment, notifications, dashboard overview/activity, Stripe/KYC/connect endpoints
- **Dev-only areas usually ignored:** `artifacts/mockup-sandbox/**`, build/helper scripts, and local workflow files unless separately exposed in production

## Threat Categories

### Spoofing

The application relies on Replit Auth sessions stored in the database and also accepts bearer-style session tokens for mobile clients. Protected routes must only trust server-issued session identifiers, must not expose reusable session tokens in unsafe locations, and must ensure that admin access is not equivalent to possession of a leaked shared secret. Mobile-specific auth flows should never downgrade `HttpOnly` cookie sessions into URL-delivered bearer tokens.

### Tampering

Users can create loans, fund loans, move wallet balances, and trigger repayment logic. All monetary state transitions must be derived from trusted server-side sources and external payment confirmations rather than direct client input. Demo-only balance mutation endpoints, one-time default funded balances, and process-local replay guards on payment confirmation are out of policy for production because they allow users to mint or replay value.

### Information Disclosure

The platform stores PII, business metrics, and privileged secrets. API responses must be scoped to the acting user, admin-only data must remain inaccessible to normal users, and secrets must never be committed to the repository, emitted to client storage, or exposed in logs, redirect URLs, or project documentation.

### Denial of Service

Public auth and marketplace routes, as well as admin verification and payment-related endpoints, are susceptible to abuse if they lack throttling or inexpensive failure handling. The system should avoid unauthenticated or low-cost requests triggering expensive third-party operations or repeated database work.

### Elevation of Privilege

The highest-risk path is a user turning ordinary account access into financial or administrative control. Server-side authorization must prevent users from accessing admin functionality via shared static secrets, manipulating balances without real payment settlement, cashing out unearned balances, reusing another user's KYC proof, or leveraging broken business logic to obtain funds or privileged visibility.
