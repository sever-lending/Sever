import { useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, ChevronRight, ArrowRight,
  UserCheck, Wallet, ShieldCheck, TrendingUp, HandCoins,
  Zap, Lock, Star, BookOpen, LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@workspace/replit-auth-web";
import {
  useGetMyProfile,
  useListMyBorrowings,
  useListMyLendings,
  getGetMyProfileQueryKey,
  getListMyBorrowingsQueryKey,
  getListMyLendingsQueryKey,
} from "@workspace/api-client-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

interface Step {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  tip?: string;
  requiresAuth?: boolean;
}

const STEPS: Step[] = [
  {
    id: "account",
    icon: UserCheck,
    title: "Create your account",
    description: "Sign in with your Replit account to get started. It takes less than 30 seconds — no credit card needed.",
    ctaLabel: "Sign in",
    ctaHref: "/",
    requiresAuth: false,
  },
  {
    id: "username",
    icon: UserCheck,
    title: "Set your username",
    description: "Choose a unique username that other users will see when you lend or borrow. Pick something professional — it builds trust.",
    ctaLabel: "Go to Profile",
    ctaHref: "/profile",
    tip: "Your username is public. Keep it clean and memorable.",
    requiresAuth: true,
  },
  {
    id: "wallet",
    icon: Wallet,
    title: "Fund your wallet",
    description: "Add money to your Sever wallet via Stripe. Once funded, you can immediately start lending or receive borrowed funds. There are no deposit fees.",
    ctaLabel: "Add Funds",
    ctaHref: "/wallet",
    tip: "Even $50 is enough to partially fund your first loan.",
    requiresAuth: true,
  },
  {
    id: "kyc",
    icon: ShieldCheck,
    title: "Complete identity verification (KYC)",
    description: "Upload a government-issued ID and a selfie. Verified accounts earn a trust tier badge, which dramatically improves your borrowing success rate and lender confidence.",
    ctaLabel: "Start KYC",
    ctaHref: "/kyc",
    tip: "KYC takes about 5 minutes. Unverified borrowers rarely get funded.",
    requiresAuth: true,
  },
  {
    id: "action",
    icon: Zap,
    title: "Make your first move",
    description: "Browse the marketplace to fund a loan and start earning interest — or post your own loan request to borrow from real people without a bank.",
    ctaLabel: "Browse Marketplace",
    ctaHref: "/marketplace",
    tip: "Not sure which path is right for you? Read the full guide first.",
    requiresAuth: true,
  },
];

function StepRow({
  step,
  status,
  isActive,
  index,
}: {
  step: Step;
  status: "complete" | "active" | "locked";
  isActive: boolean;
  index: number;
}) {
  const Icon = step.icon;
  const isComplete = status === "complete";
  const isLocked = status === "locked";

  return (
    <motion.div {...fadeUp(index * 0.07)} className="relative flex gap-4 group">
      {/* Connector line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all duration-300 ${
            isComplete
              ? "bg-primary border-primary text-primary-foreground"
              : isActive
              ? "bg-primary/10 border-primary text-primary animate-pulse"
              : "bg-muted/30 border-border text-muted-foreground"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : isLocked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Icon className="h-4.5 w-4.5 h-4 w-4" />
          )}
        </div>
        {index < STEPS.length - 1 && (
          <div
            className={`w-px flex-1 mt-1 min-h-[32px] transition-colors duration-300 ${
              isComplete ? "bg-primary/50" : "bg-border/40"
            }`}
          />
        )}
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-5 rounded-xl border p-5 transition-all duration-200 ${
          isComplete
            ? "border-primary/20 bg-primary/5"
            : isActive
            ? "border-primary/40 bg-primary/8 shadow-sm shadow-primary/10"
            : "border-border/40 bg-card/30 opacity-60"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className={`font-semibold text-sm ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                {step.title}
              </h3>
              {isComplete && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary font-medium">
                  Done
                </Badge>
              )}
              {isActive && (
                <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30 font-medium">
                  Up next
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.description}</p>
            {step.tip && !isLocked && (
              <p className="text-[11px] text-muted-foreground/70 italic mb-3">
                💡 {step.tip}
              </p>
            )}
            {(isActive) && (
              <Link href={step.ctaHref}>
                <Button size="sm" className="h-8 text-xs gap-1.5">
                  {step.ctaLabel}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function GettingStarted() {
  const { isAuthenticated, login, isLoading } = useAuth();

  const { data: profile } = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey(), enabled: isAuthenticated },
  });
  const { data: borrowings } = useListMyBorrowings({
    query: { queryKey: getListMyBorrowingsQueryKey(), enabled: isAuthenticated },
  });
  const { data: lendings } = useListMyLendings({
    query: { queryKey: getListMyLendingsQueryKey(), enabled: isAuthenticated },
  });

  const stepStatuses = useMemo<Record<string, "complete" | "active" | "locked">>(() => {
    if (!isAuthenticated) {
      return {
        account: "active",
        username: "locked",
        wallet: "locked",
        kyc: "locked",
        action: "locked",
      };
    }

    const usernameSet = !!profile?.username;
    const walletFunded = (profile?.balance ?? 0) > 0;
    const kycDone = profile?.tier && profile.tier !== "unverified";
    const hasMadeMove =
      (borrowings && borrowings.length > 0) || (lendings && lendings.length > 0);

    const results: Record<string, "complete" | "active" | "locked"> = {};

    // account always complete if authenticated
    results.account = "complete";

    if (!usernameSet) {
      results.username = "active";
      results.wallet = "locked";
      results.kyc = "locked";
      results.action = "locked";
    } else {
      results.username = "complete";
      if (!walletFunded) {
        results.wallet = "active";
        results.kyc = "locked";
        results.action = "locked";
      } else {
        results.wallet = "complete";
        if (!kycDone) {
          results.kyc = "active";
          results.action = "locked";
        } else {
          results.kyc = "complete";
          results.action = hasMadeMove ? "complete" : "active";
        }
      }
    }

    return results;
  }, [isAuthenticated, profile, borrowings, lendings]);

  const completedCount = Object.values(stepStatuses).filter((s) => s === "complete").length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);
  const isAllDone = completedCount === STEPS.length;

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Hero */}
      <div className="border-b border-border/40 bg-gradient-to-b from-primary/6 to-transparent">
        <div className="container max-w-3xl mx-auto px-4 py-14 text-center">
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-5"
          >
            <Zap className="h-3.5 w-3.5" />
            Getting started
          </motion.div>
          <motion.h1 {...fadeUp(0.06)} className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3">
            {isAllDone ? "You're all set!" : "Set up your account"}
          </motion.h1>
          <motion.p {...fadeUp(0.12)} className="text-muted-foreground text-base max-w-md mx-auto">
            {isAllDone
              ? "You've completed every step. Start lending or borrowing whenever you're ready."
              : "Follow these steps to start lending or borrowing on Sever. Most people finish in under 10 minutes."}
          </motion.p>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-10">
        {/* Progress bar */}
        {isAuthenticated && (
          <motion.div {...fadeUp(0.15)} className="mb-10">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium text-foreground">Your progress</span>
              <span className="text-muted-foreground text-xs">
                {completedCount} of {STEPS.length} steps complete
              </span>
            </div>
            <Progress value={progressPct} className="h-2" />
            {isAllDone && (
              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/8 p-4 flex items-center gap-3">
                <Star className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary">Setup complete!</p>
                  <p className="text-xs text-muted-foreground">
                    Your account is fully configured. Head to the{" "}
                    <Link href="/dashboard" className="underline underline-offset-2 hover:text-foreground">
                      dashboard
                    </Link>{" "}
                    or{" "}
                    <Link href="/marketplace" className="underline underline-offset-2 hover:text-foreground">
                      browse loans
                    </Link>
                    .
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Not logged in banner */}
        {!isAuthenticated && !isLoading && (
          <motion.div
            {...fadeUp(0.15)}
            className="mb-8 rounded-xl border border-primary/25 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="flex-1">
              <p className="font-semibold text-sm">Sign in to track your progress</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your checklist will automatically update as you complete each step.
              </p>
            </div>
            <Button size="sm" className="shrink-0 gap-2" onClick={login}>
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}

        {/* Steps */}
        <div>
          {STEPS.map((step, i) => (
            <StepRow
              key={step.id}
              step={step}
              status={stepStatuses[step.id]}
              isActive={stepStatuses[step.id] === "active"}
              index={i}
            />
          ))}
        </div>

        {/* Bottom resources */}
        <motion.div {...fadeUp(0.3)} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/tutorial">
            <div className="group rounded-xl border border-border/50 bg-card/40 p-5 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Full Platform Guide</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Detailed walkthroughs for lenders and borrowers, FAQ, and a glossary of all key terms.
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                Read guide <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
          <Link href="/help">
            <div className="group rounded-xl border border-border/50 bg-card/40 p-5 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <LifeBuoy className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">Help Center</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Search answers to common questions about accounts, payments, loans, and security.
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                Browse help <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Role shortcut cards */}
        {isAuthenticated && !isAllDone && (
          <motion.div {...fadeUp(0.36)} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/marketplace">
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-2 text-primary">
                  <TrendingUp className="h-5 w-5 shrink-0" />
                  <span className="font-semibold text-sm">I want to lend</span>
                </div>
                <p className="text-xs text-muted-foreground">Fund loans and earn 6–18% APR from real borrowers.</p>
              </div>
            </Link>
            <Link href="/borrow">
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-5 hover:border-amber-400/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-2 text-amber-400">
                  <HandCoins className="h-5 w-5 shrink-0" />
                  <span className="font-semibold text-sm">I want to borrow</span>
                </div>
                <p className="text-xs text-muted-foreground">Post a loan request and skip the bank entirely.</p>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
