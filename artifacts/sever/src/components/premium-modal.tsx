import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, X, Zap, TrendingUp, BadgePercent, Star,
  BarChart3, HandCoins, ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Plan = "monthly" | "annual";

const MONTHLY_PRICE = 14.99;
const ANNUAL_PRICE = 99;
const ANNUAL_MONTHLY_EQUIV = (ANNUAL_PRICE / 12).toFixed(2);
const ANNUAL_SAVINGS_PCT = Math.round((1 - ANNUAL_PRICE / (MONTHLY_PRICE * 12)) * 100);

interface Benefit {
  icon: React.ElementType;
  color: string;
  title: string;
  free: string;
  premium: string;
  highlight?: boolean;
}

const BENEFITS: Benefit[] = [
  {
    icon: BadgePercent,
    color: "text-primary",
    title: "Origination fee",
    free: "1.5%",
    premium: "0.75% — save 50%",
    highlight: true,
  },
  {
    icon: TrendingUp,
    color: "text-primary",
    title: "Loan limit",
    free: "Up to $50,000",
    premium: "Up to $100,000",
  },
  {
    icon: HandCoins,
    color: "text-amber-400",
    title: "Marketplace priority",
    free: "Standard listing",
    premium: "Top-of-page placement",
    highlight: true,
  },
  {
    icon: Zap,
    color: "text-yellow-400",
    title: "Early loan access",
    free: "Standard timing",
    premium: "24 h before everyone else",
  },
  {
    icon: BarChart3,
    color: "text-sky-400",
    title: "Portfolio analytics",
    free: "Basic overview",
    premium: "Advanced projections & risk",
  },
  {
    icon: Crown,
    color: "text-amber-400",
    title: "Premium badge",
    free: "No badge",
    premium: "Verified Premium — builds trust",
    highlight: true,
  },
];

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PremiumModal({ open, onClose, onSuccess }: PremiumModalProps) {
  const [plan, setPlan] = useState<Plan>("annual");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/stripe/premium-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not start checkout");
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: any) {
      toast({ title: "Couldn't open checkout", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const price = plan === "monthly" ? MONTHLY_PRICE : ANNUAL_PRICE;
  const priceLabel =
    plan === "monthly"
      ? `$${MONTHLY_PRICE}/month`
      : `$${ANNUAL_PRICE}/year  ($${ANNUAL_MONTHLY_EQUIV}/mo)`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-2xl border border-border/60 bg-[#0b1622] shadow-2xl"
          >
            {/* Gradient top accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 mb-4 mx-auto relative">
                  <Crown className="h-7 w-7 text-primary" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary/60" />
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Sever{" "}
                    <span className="bg-gradient-to-r from-primary to-emerald-300 bg-clip-text text-transparent">
                      Premium
                    </span>
                  </h2>
                  <Sparkles className="h-5 w-5 text-primary/70" />
                </div>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Lower fees, bigger limits, and a real edge — for lenders and borrowers alike.
                </p>
              </div>

              {/* Billing toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-card/50 p-1">
                  <button
                    onClick={() => setPlan("monthly")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      plan === "monthly"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setPlan("annual")}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      plan === "annual"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Annual
                    <Badge className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground font-bold border-0">
                      SAVE {ANNUAL_SAVINGS_PCT}%
                    </Badge>
                  </button>
                </div>
              </div>

              {/* Benefits grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {BENEFITS.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.title}
                      className={`rounded-xl border p-4 transition-all ${
                        b.highlight
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/40 bg-card/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 ${b.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground mb-1">{b.title}</p>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                              <span className="text-[11px] text-muted-foreground line-through">{b.free}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                              <span className="text-[11px] text-foreground font-medium">{b.premium}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Savings callout for annual */}
              <AnimatePresence mode="wait">
                {plan === "annual" && (
                  <motion.div
                    key="annual-callout"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-5"
                  >
                    <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 flex items-center gap-3">
                      <Star className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Annual plan saves you{" "}
                        <span className="text-foreground font-semibold">
                          ${((MONTHLY_PRICE * 12) - ANNUAL_PRICE).toFixed(0)} per year
                        </span>{" "}
                        vs monthly — that's{" "}
                        <span className="text-primary font-semibold">
                          ${ANNUAL_MONTHLY_EQUIV}/month
                        </span>
                        . Cancel anytime.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Savings callout for borrowers */}
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 flex items-center gap-3 mb-6">
                <BadgePercent className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  On a{" "}
                  <span className="text-foreground font-semibold">$10,000 loan</span>, the 0.75%
                  fee saves you{" "}
                  <span className="text-amber-400 font-semibold">$75 vs $150 standard</span> —
                  the monthly plan pays for itself{" "}
                  <span className="text-foreground font-semibold">5× over</span> on a single loan.
                </p>
              </div>

              {/* CTA */}
              <div className="space-y-3 text-center">
                <Button
                  size="lg"
                  className="w-full h-12 text-base font-bold gap-2 bg-primary hover:bg-primary/90 relative overflow-hidden group"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Crown className="h-5 w-5" />
                  {loading
                    ? "Opening checkout…"
                    : `Upgrade to Premium — ${priceLabel}`}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
                <button
                  onClick={onClose}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Not right now — maybe later
                </button>
              </div>

              <p className="text-center text-[10px] text-muted-foreground/60 mt-4">
                Secure payment via Stripe · Cancel anytime · No hidden fees
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
