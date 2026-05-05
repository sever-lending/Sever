import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetPlatformStats, useGetLenderLeaderboard, useListLoans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, formatPercentage } from "@/lib/formatters";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Lock,
  TrendingUp,
  Users,
  Clock,
  Star,
  ChevronDown,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";

const APP_STORE_URL = "https://apps.apple.com/app/sever-lending/id0000000000";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.severlending.sever";

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
    </svg>
  );
}

function PlayLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden>
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  );
}

function StoreBadge({
  href,
  icon,
  line1,
  line2,
}: {
  href: string;
  icon: React.ReactNode;
  line1: string;
  line2: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-foreground/5 border border-foreground/10 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 min-w-[160px]"
    >
      {icon}
      <div className="text-left leading-tight">
        <p className="text-[10px] text-muted-foreground group-hover:text-foreground/60 transition-colors">{line1}</p>
        <p className="text-sm font-bold tracking-tight">{line2}</p>
      </div>
    </a>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, delay },
});

const TIER_ORDER = ["platinum", "gold", "silver", "bronze", "unverified"];
function tierColor(tier: string) {
  return { platinum: "#e5e7eb", gold: "#f59e0b", silver: "#94a3b8", bronze: "#b45309", unverified: "#6b7280" }[tier] ?? "#6b7280";
}

function PurposePill({ purpose }: { purpose: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20">
      {purpose}
    </span>
  );
}

export function Landing() {
  const { isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetPlatformStats();
  const { data: lenders, isLoading: lendersLoading } = useGetLenderLeaderboard();
  const { data: loans, isLoading: loansLoading } = useListLoans();

  const featured = loans?.slice(0, 4) ?? [];

  return (
    <div className="flex-1 flex flex-col items-center overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Ambient orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        {/* Dot grid */}
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

        <div className="relative z-10 max-w-[860px] flex flex-col items-center">
          <motion.div {...fadeUp(0.05)}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary mb-8 shadow-[0_0_24px_0_rgba(45,212,160,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Lending network is live
            </div>
          </motion.div>

          <motion.h1 {...fadeUp(0.15)} className="text-6xl md:text-[88px] font-extrabold tracking-tighter leading-[0.92] mb-6">
            Your money.{" "}
            <br className="hidden sm:block" />
            Your terms.
            <br />
            <span className="gradient-text">No banks.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.28)} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-[560px] leading-relaxed">
            Borrow without permission. Lend with confidence. The peer-to-peer credit protocol powered by community trust.
          </motion.p>

          <motion.div {...fadeUp(0.38)} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-10">
            {isAuthenticated ? (
              <Button
                size="lg"
                className="h-14 px-8 text-base font-bold tracking-tight rounded-xl shadow-[0_0_32px_0_rgba(45,212,160,0.35)] hover:shadow-[0_0_48px_0_rgba(45,212,160,0.5)] transition-shadow"
                onClick={() => setLocation("/dashboard")}
              >
                OPEN DASHBOARD <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-bold tracking-tight rounded-xl shadow-[0_0_32px_0_rgba(45,212,160,0.35)] hover:shadow-[0_0_48px_0_rgba(45,212,160,0.5)] transition-all duration-300"
                  onClick={login}
                >
                  START LENDING <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-bold tracking-tight rounded-xl border-border/60 bg-background/40 backdrop-blur hover:bg-background/70 hover:border-primary/40 transition-all duration-300"
                  onClick={login}
                >
                  BORROW FUNDS
                </Button>
              </>
            )}
          </motion.div>

          <motion.div {...fadeIn(0.44)} className="flex flex-wrap items-center justify-center gap-2.5 mb-5">
            <StoreBadge href={APP_STORE_URL} icon={<AppleLogo />} line1="Download on the" line2="App Store" />
            <StoreBadge href={PLAY_STORE_URL} icon={<PlayLogo />} line1="Get it on" line2="Google Play" />
          </motion.div>

          <motion.div {...fadeIn(0.48)} className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="inline-block h-px w-8 bg-border/60" />
            <span>Free to join · No credit card required</span>
            <span className="inline-block h-px w-8 bg-border/60" />
          </motion.div>

          <motion.div {...fadeIn(0.55)} className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["P", "M", "D", "A"].map((l, i) => (
                <div key={i} className="h-7 w-7 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                  {l}
                </div>
              ))}
            </div>
            <span>
              Trusted by <strong className="text-foreground">2,400+</strong> members
            </span>
          </motion.div>
        </div>

        <motion.div {...fadeIn(0.9)} className="absolute bottom-8 flex flex-col items-center gap-1 text-muted-foreground/40">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="w-full py-0">
        <div className="w-full border-y border-border/40 bg-card/60 backdrop-blur-xl">
          <div className="container px-4 md:px-6 mx-auto py-12">
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-12 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { val: formatMoney(stats.totalVolume).replace(/\.\d+$/, ""), label: "Total Volume", accent: false },
                  { val: formatPercentage(stats.averageRate), label: "Avg Yield", accent: true },
                  { val: String(stats.activeLoans), label: "Active Loans", accent: false },
                  { val: String(stats.totalLenders + stats.totalBorrowers), label: "Network Members", accent: false },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    {...fadeUp(0.1 + i * 0.08)}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className={`text-4xl md:text-5xl font-bold font-mono tracking-tighter ${s.accent ? "gradient-text" : "text-foreground"}`}>
                      {s.val}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{s.label}</span>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="w-full py-28 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <p className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">The Protocol</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">How it works.</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Direct peer-to-peer credit. No banks in the middle.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: ShieldCheck,
                title: "Verified Trust",
                body: "Every borrower earns a community trust score based on their history. Transparent risk, visible to every lender.",
              },
              {
                step: "02",
                icon: Zap,
                title: "Direct Funding",
                body: "Lenders fund requests directly — no intermediaries holding your capital. Platform earns a flat 1.5% origination fee.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Earn Yield",
                body: "Borrowers make scheduled repayments. Lenders receive principal and interest directly to their wallet.",
              },
            ].map((card, i) => (
              <motion.div key={i} {...fadeUp(0.1 + i * 0.1)}>
                <div className="glass-card group h-full p-8 flex flex-col gap-5 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                  <span className="font-mono text-5xl font-bold text-primary/15 leading-none select-none group-hover:text-primary/25 transition-colors duration-500">
                    {card.step}
                  </span>
                  <div className="p-2.5 rounded-xl bg-primary/10 w-fit shadow-[0_0_20px_0_rgba(45,212,160,0.2)]">
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight mb-2">{card.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{card.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="w-full py-24 px-4 bg-card/30 border-y border-border/40">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <p className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-4">Why Sever</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Built different.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Lock, title: "Non-Custodial", body: "We never hold your funds. All capital moves peer-to-peer through verified channels." },
              { icon: TrendingUp, title: "Real Yields", body: "Earn 6–18% APR on loans you choose. No locked-up liquidity pools or black-box algorithms." },
              { icon: ShieldCheck, title: "KYC Verified", body: "Every user completes Stripe Identity verification before participating in any transaction." },
              { icon: Zap, title: "Instant Decisions", body: "Post a loan request and get funded within hours — not weeks — when your trust score is strong." },
              { icon: Users, title: "Community Trust", body: "Trust scores are built in public, from real repayment history visible to all lenders." },
              { icon: Clock, title: "Flexible Terms", body: "1 to 60-month terms, any APR the market agrees on. No rate caps imposed by us." },
            ].map((f, i) => (
              <motion.div key={i} {...fadeUp(0.05 + i * 0.07)}>
                <div className="glass-card group p-6 flex flex-col gap-4 h-full hover:border-primary/30 transition-colors duration-300">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-tight mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE LOANS ── */}
      {(loansLoading || featured.length > 0) && (
        <section className="w-full py-28 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div {...fadeUp(0)} className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-2">Live Marketplace</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Open loan requests.</h2>
              </div>
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest hover:bg-primary/10"
                onClick={() => setLocation(isAuthenticated ? "/marketplace" : "/lenders")}
              >
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {loansLoading
                ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
                : featured.map((loan, i) => {
                    const pct = loan.principal > 0 ? Math.min((loan.fundedAmount / loan.principal) * 100, 100) : 0;
                    return (
                      <motion.div key={loan.id} {...fadeUp(0.08 + i * 0.07)}>
                        <div
                          className="glass-card p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/40 hover:shadow-[0_0_24px_0_rgba(45,212,160,0.1)] transition-all duration-300"
                          onClick={() => isAuthenticated ? setLocation(`/marketplace`) : login()}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground font-medium">{loan.borrowerName}</span>
                                <span className="text-xs text-muted-foreground/60">· {loan.borrowerTrustScore}</span>
                              </div>
                              <p className="font-semibold tracking-tight truncate">{loan.title}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-2xl font-bold font-mono gradient-text leading-none">{loan.interestRate}%</p>
                              <p className="text-xs text-muted-foreground">APR</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <p className="font-semibold">{formatMoney(loan.principal)}</p>
                              <p className="text-xs text-muted-foreground">Principal</p>
                            </div>
                            <div>
                              <p className="font-semibold">{loan.termMonths}mo</p>
                              <p className="text-xs text-muted-foreground">Term</p>
                            </div>
                            <div className="ml-auto">
                              <PurposePill purpose={loan.purpose} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{pct.toFixed(0)}% funded</span>
                              <span>{formatMoney(loan.fundedAmount)} / {formatMoney(loan.principal)}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-border overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-[0_0_8px_0_rgba(45,212,160,0.6)] transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
            </div>
          </div>
        </section>
      )}

      {/* ── TOP LENDERS ── */}
      <section className="w-full py-24 px-4 bg-card/30 border-t border-border/40">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeUp(0)} className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-2">Community</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Top capital providers.</h2>
              <p className="text-muted-foreground mt-1">The network is backed by the community.</p>
            </div>
            <Button
              variant="ghost"
              className="hidden md:flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest hover:bg-primary/10"
              onClick={() => setLocation("/lenders")}
            >
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <div className="space-y-3">
            {lendersLoading
              ? [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
              : lenders?.slice(0, 5).map((lender, i) => (
                  <motion.div key={lender.userId} {...fadeUp(0.08 + i * 0.08)}>
                    <div className="glass-card flex items-center gap-5 px-6 py-5 hover:border-primary/30 transition-colors duration-300 group">
                      <div className="relative">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 border-border/60"
                          style={{ backgroundColor: tierColor(lender.tier) + "22", color: tierColor(lender.tier), borderColor: tierColor(lender.tier) + "44" }}
                        >
                          {lender.displayName?.[0] ?? "?"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center text-[9px] font-bold font-mono text-muted-foreground">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">{lender.displayName}</p>
                        <p className="text-xs text-muted-foreground uppercase font-mono tracking-wide">{lender.tier} Tier · {lender.loansFunded} loans</p>
                      </div>
                      {i === 0 && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 shrink-0" />}
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-lg">{formatMoney(lender.totalLent)}</p>
                        <p className="text-xs text-muted-foreground font-mono">total supplied</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD THE APP ── */}
      <section className="w-full py-24 px-4 border-t border-border/40">
        <div className="container mx-auto max-w-5xl">
          <div className="glass-card relative overflow-hidden p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="orb" style={{ width: 300, height: 300, top: -80, right: -60, background: "radial-gradient(circle, rgba(45,212,160,0.12) 0%, transparent 70%)", position: "absolute", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />

            <div className="relative z-10 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-5">
                <Smartphone className="h-3.5 w-3.5" />
                Mobile App
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-3">
                Sever in your pocket.
              </h2>
              <p className="text-muted-foreground text-base mb-7 max-w-md">
                Track your portfolio, fund loans, and manage repayments from anywhere. Available on iOS and Android.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <StoreBadge href={APP_STORE_URL} icon={<AppleLogo />} line1="Download on the" line2="App Store" />
                <StoreBadge href={PLAY_STORE_URL} icon={<PlayLogo />} line1="Get it on" line2="Google Play" />
              </div>
            </div>

            <div className="relative z-10 shrink-0 hidden md:flex flex-col items-center gap-2">
              <div className="w-[180px] h-[320px] rounded-[32px] border-2 border-border/60 bg-card/80 overflow-hidden shadow-2xl shadow-primary/10 flex flex-col">
                <div className="h-6 flex items-center justify-center">
                  <div className="w-16 h-1.5 rounded-full bg-border/60 mt-2" />
                </div>
                <div className="flex-1 px-3 py-2 flex flex-col gap-2">
                  <div className="text-center py-2">
                    <p className="text-[10px] font-bold tracking-widest text-foreground">SEVER<span className="text-primary">.</span></p>
                    <p className="text-[8px] text-muted-foreground">P2P Lending</p>
                  </div>
                  {[
                    { label: "Emergency dental work", rate: "12.5%", funded: 40 },
                    { label: "Used Toyota for delivery", rate: "10%", funded: 67 },
                    { label: "HVAC replacement", rate: "8.75%", funded: 20 },
                  ].map((l, i) => (
                    <div key={i} className="rounded-lg border border-border/60 bg-background/60 p-2">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-[9px] leading-tight text-foreground/80 flex-1 pr-1">{l.label}</p>
                        <p className="text-[11px] font-bold text-primary shrink-0">{l.rate}</p>
                      </div>
                      <div className="h-1 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${l.funded}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-10 border-t border-border/40 flex items-center justify-around px-4">
                  {["📊", "💼", "➕", "👛", "👤"].map((e, i) => (
                    <span key={i} className="text-[12px]">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative w-full py-32 px-4 overflow-hidden">
        <div className="orb orb-cta-1" />
        <div className="orb orb-cta-2" />
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
        <div className="relative z-10 container mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-mono text-primary uppercase tracking-[0.25em] mb-6">Get Started</p>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-5">
              Start earning today.
              <br />
              <span className="gradient-text">No bank required.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Join thousands of members lending and borrowing on their own terms. Earn real yields. Build trust. No permission needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="h-14 px-10 text-base font-bold rounded-xl shadow-[0_0_40px_0_rgba(45,212,160,0.4)] hover:shadow-[0_0_60px_0_rgba(45,212,160,0.6)] transition-all duration-300"
                onClick={login}
              >
                CREATE FREE ACCOUNT <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 text-base font-bold rounded-xl border-border/60 bg-background/30 backdrop-blur hover:border-primary/40 transition-all duration-300"
                onClick={() => setLocation("/lenders")}
              >
                EXPLORE LENDERS
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground/60">
              Free to join · No credit card required · P2P lending involves risk of capital loss
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
