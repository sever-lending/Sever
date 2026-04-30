import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetPlatformStats, useGetLenderLeaderboard } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, formatPercentage } from "@/lib/formatters";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function Landing() {
  const { isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetPlatformStats();
  const { data: lenders, isLoading: lendersLoading } = useGetLenderLeaderboard();

  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[800px] flex flex-col items-center"
        >
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Lending network is live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
            Your money. <br className="md:hidden" /> Your terms. <br /> No banks.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-[600px] leading-relaxed">
            Borrow without permission. Lend with confidence. The peer-to-peer credit protocol powered by community trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {isAuthenticated ? (
              <Button size="lg" className="h-14 px-8 text-lg font-bold tracking-tight rounded-none" onClick={() => setLocation('/dashboard')}>
                OPEN DASHBOARD <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button size="lg" className="h-14 px-8 text-lg font-bold tracking-tight rounded-none" onClick={login}>
                  START LENDING
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold tracking-tight rounded-none bg-transparent" onClick={login}>
                  BORROW FUNDS
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 bg-muted/30 border-y border-border">
        <div className="container px-4 md:px-6 mx-auto">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-border/50">
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-bold font-mono tracking-tighter text-foreground mb-2">
                  {formatMoney(stats.totalVolume).replace(/\.\d+$/, '')}
                </span>
                <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Total Volume</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-bold font-mono tracking-tighter text-primary mb-2">
                  {formatPercentage(stats.averageRate)}
                </span>
                <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Avg Yield</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-bold font-mono tracking-tighter text-foreground mb-2">
                  {stats.activeLoans}
                </span>
                <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Active Loans</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-bold font-mono tracking-tighter text-foreground mb-2">
                  {stats.totalLenders + stats.totalBorrowers}
                </span>
                <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Network Members</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-24 px-4 container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">How it works.</h2>
          <p className="text-muted-foreground text-lg">Direct peer-to-peer credit protocol.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-background border-border rounded-none shadow-none">
            <CardHeader>
              <ShieldCheck className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-xl uppercase tracking-wider font-mono">1. Verified Trust</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Every borrower is assigned a community trust score based on their history. Transparent risk assessment.</p>
            </CardContent>
          </Card>
          <Card className="bg-background border-border rounded-none shadow-none">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-xl uppercase tracking-wider font-mono">2. Direct Funding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lenders fund loan requests directly. No intermediaries holding your capital. Platform takes a flat 1.5% fee.</p>
            </CardContent>
          </Card>
          <Card className="bg-background border-border rounded-none shadow-none">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-xl uppercase tracking-wider font-mono">3. Earn Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Borrowers make scheduled repayments. Lenders receive principal and interest directly to their wallets.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Top Lenders */}
      <section className="w-full py-24 bg-card px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">Top Capital Providers.</h2>
              <p className="text-muted-foreground">The network is backed by the community.</p>
            </div>
            <Button variant="link" className="text-primary uppercase tracking-widest font-mono" onClick={() => setLocation('/lenders')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {lendersLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-none" />)
            ) : lenders ? (
              lenders.slice(0, 3).map((lender, i) => (
                <div key={lender.userId} className="flex items-center justify-between p-6 bg-background border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 flex items-center justify-center bg-primary/20 text-primary font-mono font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold">{lender.displayName}</div>
                      <div className="text-xs font-mono text-muted-foreground uppercase">{lender.tier} TIER</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold">{formatMoney(lender.totalLent)}</div>
                    <div className="text-xs text-muted-foreground font-mono uppercase">Total Supplied</div>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
