import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Store,
  FileText,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  HandCoins,
  UserCheck,
  Clock,
  DollarSign,
  ShieldCheck,
  Star,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  BadgePercent,
  Repeat,
  PiggyBank,
  ClipboardList,
  Users,
  Zap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

type Role = "lender" | "borrower";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
  cta?: { label: string; href: string };
}

const lenderSteps: Step[] = [
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Fund your wallet",
    description:
      "Before you can lend, you need money in your Sever wallet. Head to the Wallet page and click \"Add Funds\". You'll be taken to a secure Stripe checkout — enter your card details and your balance will be credited instantly. There are no fees for deposits.",
    tip: "Start small. Even $50 lets you partially fund a loan and see how the platform works.",
    cta: { label: "Go to Wallet", href: "/wallet" },
  },
  {
    icon: <Store className="h-6 w-6" />,
    title: "Browse the marketplace",
    description:
      "Visit the Marketplace to see all open loan requests. Each card shows the borrower's requested amount, interest rate, loan purpose, and how much has already been funded. Sort by highest rate or lowest risk using the filters at the top.",
    tip: "Look at the borrower's trust score (0–1000). Scores above 700 indicate a strong repayment history.",
    cta: { label: "Browse Loans", href: "/marketplace" },
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Review the loan",
    description:
      "Click any loan to open its detail page. You'll see the borrower's purpose, loan term, monthly installment amount, and their tier badge (Unverified → Bronze → Silver → Gold → Platinum). Higher tiers have completed KYC verification.",
    tip: "P2P lending carries real risk. Only lend what you can afford to lose. Never fund a borrower whose purpose seems unclear.",
  },
  {
    icon: <HandCoins className="h-6 w-6" />,
    title: "Choose your amount & fund",
    description:
      "You don't have to fund the entire loan — Sever supports partial funding. Enter any amount up to the remaining unfunded balance. Review and accept the Loan Agreement (three checkboxes: risk acknowledgement, terms, and KYC confirmation), then confirm. Your wallet is debited instantly.",
    tip: "Spreading funds across multiple loans is a smart way to reduce exposure to any single borrower.",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Track your portfolio",
    description:
      "The Portfolio page shows every loan you've funded, its status (open, repaying, repaid, defaulted), the next payment due date, and your projected return. Once a loan is fully funded by all lenders, it transitions to \"repaying\" and the repayment schedule begins.",
    cta: { label: "View Portfolio", href: "/portfolio" },
  },
  {
    icon: <Repeat className="h-6 w-6" />,
    title: "Receive monthly repayments",
    description:
      "Repayments happen automatically each month. Borrowers pay into the platform; your share (proportional to your funding) is added to your wallet. You can withdraw funds or re-lend them to compound your returns. Late payments incur a fee — you receive 50% of any late fee collected on loans you funded.",
    tip: "Reinvesting repayments back into new loans is the fastest way to grow your return.",
    cta: { label: "Go to Wallet", href: "/wallet" },
  },
];

const borrowerSteps: Step[] = [
  {
    icon: <UserCheck className="h-6 w-6" />,
    title: "Complete your profile & KYC",
    description:
      "Lenders can only trust who they can verify. Fill in your profile and complete the KYC (Know Your Customer) process — it takes about 5 minutes. You'll upload a government-issued ID and a selfie. Verified users earn a tier badge (Bronze and above), which dramatically increases your funding success rate.",
    tip: "Unverified borrowers are much harder to fund. Complete KYC before requesting a loan.",
    cta: { label: "Start KYC", href: "/kyc" },
  },
  {
    icon: <ClipboardList className="h-6 w-6" />,
    title: "Post a loan request",
    description:
      "Go to the Borrow page. Enter the amount you need ($100–$50,000), choose a repayment term (3–60 months), set the annual interest rate you're offering to pay, and describe your purpose clearly. A specific, honest purpose (e.g. \"replace broken HVAC unit\" beats \"personal expenses\") earns more lender trust.",
    tip: "A higher interest rate makes your loan more attractive to lenders, but raises your monthly payment. Use the calculator to find a balance.",
    cta: { label: "Request a Loan", href: "/borrow" },
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Wait for funding",
    description:
      "Once posted, your loan appears in the marketplace for lenders to browse. Funding can take anywhere from a few hours to several days depending on your rate, trust score, and loan size. You'll receive an in-app notification as each lender funds a portion. You can cancel an unfunded loan at any time.",
    tip: "Loans in the $500–$5,000 range with rates above 9% tend to fund fastest on Sever.",
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Receive your funds",
    description:
      "When your loan reaches 100% funding, the platform automatically disburses the proceeds (minus the 1.5% origination fee) directly to your Sever wallet. A repayment schedule is generated at the same time — you'll see each installment's due date and amount on your dashboard.",
    tip: "The origination fee (1.5% of the loan amount) is deducted at disbursement, not at repayment. Factor this into how much you request.",
    cta: { label: "View Dashboard", href: "/dashboard" },
  },
  {
    icon: <Repeat className="h-6 w-6" />,
    title: "Make your monthly payments",
    description:
      "Each month, your installment amount is due. Go to your Dashboard and click \"Make Payment\" on the upcoming installment. The payment is drawn from your wallet balance — so keep it topped up. On-time payments raise your trust score; late payments incur a $5 + 2% late fee on top of your installment.",
    tip: "Set a reminder or top up your wallet a few days before each due date so you're never caught short.",
    cta: { label: "Go to Dashboard", href: "/dashboard" },
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Build your trust score",
    description:
      "Every on-time payment increases your trust score (0–1000). A higher score unlocks higher borrower tiers (Bronze → Silver → Gold → Platinum), lowers the rate lenders expect, and makes future loans fund much faster. Your score is visible to all lenders, so a strong track record is your most valuable asset on Sever.",
    tip: "Even one missed payment can set your score back significantly. Consistency is everything.",
    cta: { label: "View Profile", href: "/profile" },
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Is my money safe?",
    a: "Sever is a marketplace platform, not a bank, and loans are not insured by the FDIC or any government body. You can lose money if a borrower defaults. Never lend more than you can afford to lose. Diversifying across many loans significantly reduces risk.",
  },
  {
    q: "How does the interest rate work?",
    a: "Borrowers set their own annual interest rate (APR) when posting a loan. Lenders earn that rate proportional to the amount they funded. For example, if you fund $200 of a $1,000 loan at 12% APR over 12 months, you'd earn roughly $24 in interest over the life of the loan (before any defaults).",
  },
  {
    q: "What happens if a borrower misses a payment?",
    a: "The borrower incurs a late fee ($5 + 2% of the installment). You receive 50% of any late fee collected on loans you funded. If a loan reaches default status, the remaining balance is written off and distributed as a loss to lenders. Sever does not guarantee repayment.",
  },
  {
    q: "What is the origination fee?",
    a: "When a loan is fully funded, Sever deducts a 1.5% origination fee from the disbursement. This fee goes to the platform and covers operating costs. For example, a $1,000 loan disbursement would be $985 after the fee.",
  },
  {
    q: "Can I withdraw my wallet balance?",
    a: "Yes. You can request a withdrawal from your Sever wallet at any time. Once lent, funds are locked in the loan until repaid — you cannot recall a funded loan early. Only your uncommitted wallet balance is available to withdraw.",
  },
  {
    q: "What is KYC and why do I need it?",
    a: "KYC (Know Your Customer) is an identity verification process required by financial regulations. On Sever it involves uploading a government-issued ID and a selfie. Completing KYC unlocks higher trust tiers, which makes lenders far more willing to fund your loans and at better rates.",
  },
];

const glossary: { term: string; definition: string }[] = [
  { term: "Trust Score", definition: "A number from 0 to 1,000 measuring a borrower's repayment reliability. Earned through on-time payments; reduced by late payments or defaults." },
  { term: "Origination Fee", definition: "A 1.5% platform fee deducted from the loan amount at the time of disbursement to the borrower." },
  { term: "Installment", definition: "A fixed monthly payment made by the borrower that covers both principal and interest." },
  { term: "Partial Funding", definition: "Lending only a portion of a requested loan amount. Multiple lenders can fund a single loan simultaneously." },
  { term: "Tier", definition: "A borrower's rank on Sever: Unverified → Bronze → Silver → Gold → Platinum. Higher tiers indicate better creditworthiness and verification status." },
  { term: "Late Fee", definition: "A $5 + 2% fee charged when a borrower misses a payment due date. Half goes to the platform; half is distributed to the loan's lenders." },
  { term: "Default", definition: "When a borrower fails to repay their loan and the debt is written off. Lenders lose their outstanding principal on defaulted loans." },
  { term: "APR", definition: "Annual Percentage Rate — the yearly cost of the loan expressed as a percentage. Borrowers set this rate when posting a loan request." },
];

function StepCard({ step, index, role }: { step: Step; index: number; role: Role }) {
  const color = role === "lender" ? "text-primary" : "text-amber-400";
  const borderColor = role === "lender" ? "border-primary/30 bg-primary/5" : "border-amber-400/30 bg-amber-400/5";
  const numberBg = role === "lender" ? "bg-primary/20 text-primary" : "bg-amber-400/20 text-amber-400";

  return (
    <motion.div
      {...fadeUp(index * 0.08)}
      className="relative flex gap-5 group"
    >
      <div className="flex flex-col items-center gap-0">
        <div className={`flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm shrink-0 ${numberBg}`}>
          {index + 1}
        </div>
        {index < (role === "lender" ? lenderSteps : borrowerSteps).length - 1 && (
          <div className="w-px flex-1 mt-2 bg-border/40 min-h-[40px]" />
        )}
      </div>

      <div className={`flex-1 mb-8 rounded-xl border p-6 ${borderColor} hover:border-opacity-60 transition-all duration-200`}>
        <div className={`flex items-center gap-3 mb-3 ${color}`}>
          {step.icon}
          <h3 className="font-bold text-lg text-foreground">{step.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {step.description}
        </p>
        {step.tip && (
          <div className="flex items-start gap-2 rounded-lg bg-background/60 border border-border/40 px-4 py-3 text-xs text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-400" />
            <span>{step.tip}</span>
          </div>
        )}
        {step.cta && (
          <div className="mt-4">
            <Link href={step.cta.href}>
              <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                {step.cta.label} <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium hover:text-foreground text-foreground/80 transition-colors gap-4"
      >
        <span>{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Tutorial() {
  const [role, setRole] = useState<Role>("lender");
  const { isAuthenticated, login } = useAuth();
  const steps = role === "lender" ? lenderSteps : borrowerSteps;

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Header */}
      <div className="relative border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
            <BookOpen className="h-3.5 w-3.5" />
            Beginner Guide
          </motion.div>
          <motion.h1 {...fadeUp(0.06)} className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
            How Sever works
          </motion.h1>
          <motion.p {...fadeUp(0.12)} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Whether you want to grow your money by lending, or access fast funding without a bank — this guide covers everything you need to get started.
          </motion.p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Role selector */}
        <motion.div {...fadeUp(0.16)} className="flex justify-center mb-12">
          <div className="inline-flex rounded-xl border border-border/60 bg-card/60 p-1 gap-1">
            <button
              onClick={() => setRole("lender")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === "lender"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              I want to lend
            </button>
            <button
              onClick={() => setRole("borrower")}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === "borrower"
                  ? "bg-amber-400 text-amber-950 shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HandCoins className="h-4 w-4" />
              I want to borrow
            </button>
          </div>
        </motion.div>

        {/* Overview pill */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className={`rounded-xl border p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
              role === "lender"
                ? "border-primary/25 bg-primary/5"
                : "border-amber-400/25 bg-amber-400/5"
            }`}>
              {role === "lender" ? (
                <>
                  <div className="flex items-center gap-3 text-primary">
                    <PiggyBank className="h-8 w-8 shrink-0" />
                    <div>
                      <p className="font-bold text-foreground">Lend money. Earn interest.</p>
                      <p className="text-sm text-muted-foreground">Fund verified borrowers and receive monthly repayments with interest. Rates range from 6–18% APR.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 sm:ml-auto shrink-0 text-center">
                    {[
                      { label: "Avg. Return", value: "11.4%" },
                      { label: "Loan Terms", value: "3–60mo" },
                      { label: "Min. Lend", value: "$10" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-lg font-bold text-primary">{value}</p>
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-amber-400">
                    <HandCoins className="h-8 w-8 shrink-0" />
                    <div>
                      <p className="font-bold text-foreground">Borrow from real people. Skip the bank.</p>
                      <p className="text-sm text-muted-foreground">Post a loan request, set your own rate, and get funded directly by individual lenders — usually within 48 hours.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 sm:ml-auto shrink-0 text-center">
                    {[
                      { label: "Borrow up to", value: "$50K" },
                      { label: "Avg. Funded", value: "< 48h" },
                      { label: "Origination", value: "1.5%" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-lg font-bold text-amber-400">{value}</p>
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Steps */}
            <h2 className="text-xl font-bold mb-8">
              Step-by-step: {role === "lender" ? "lending on Sever" : "borrowing on Sever"}
            </h2>
            <div>
              {steps.map((step, i) => (
                <StepCard key={i} step={step} index={i} role={role} />
              ))}
            </div>

            {/* Risk notice */}
            <div className={`rounded-xl border p-5 flex items-start gap-3 mt-2 mb-16 ${
              role === "lender"
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-blue-400/30 bg-blue-400/5"
            }`}>
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-yellow-400" />
              <div>
                <p className="text-sm font-semibold mb-1">
                  {role === "lender" ? "Lending risk reminder" : "Borrowing responsibility"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {role === "lender"
                    ? "P2P lending is not the same as a savings account. Your capital is at risk. Loans are not FDIC-insured. Diversify across loans and only invest money you can afford to lose. Read our full Risk Disclaimer before lending."
                    : "Taking a loan is a legal obligation. Missing payments damages your trust score, triggers late fees, and may result in default reporting. Only borrow what you can realistically repay on your income."}
                </p>
                <Link href={role === "lender" ? "/legal/disclaimer" : "/legal/terms"}>
                  <button className="text-xs text-primary hover:underline mt-1.5">
                    Read the full {role === "lender" ? "Risk Disclaimer" : "Terms of Service"} →
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* FAQ */}
        <motion.div {...fadeUp(0.1)}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border/40" />
            <h2 className="text-xl font-bold shrink-0">Frequently asked questions</h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="rounded-xl border border-border/40 bg-card/40 px-6 mb-16">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>

        {/* Glossary */}
        <motion.div {...fadeUp(0.1)}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border/40" />
            <h2 className="text-xl font-bold shrink-0">Glossary</h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
            {glossary.map(({ term, definition }) => (
              <div key={term} className="rounded-xl border border-border/40 bg-card/40 p-4">
                <p className="text-sm font-bold text-primary mb-1">{term}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{definition}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.1)} className="rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-5">
            <Zap className="h-3.5 w-3.5" />
            Ready to get started?
          </div>
          <h2 className="text-3xl font-extrabold tracking-tighter mb-3">
            You know how it works.<br />Now try it.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Join thousands of people already lending and borrowing on Sever. Free to join, no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/marketplace">
                  <Button size="lg" className="gap-2">
                    Browse loans <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/borrow">
                  <Button size="lg" variant="outline" className="gap-2">
                    Request a loan
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button size="lg" className="gap-2" onClick={login}>
                  Create free account <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="/lenders">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Meet our lenders
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
