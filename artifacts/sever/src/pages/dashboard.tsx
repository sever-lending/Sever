import { Link } from "wouter";
import { useGetDashboardOverview, useGetMyProfile, getGetDashboardOverviewQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatMoney, formatPercentage, formatDate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wallet, Activity, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { usePayInstallment } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/empty-state";
import { DonationCard } from "@/components/donation-card";

export function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useGetDashboardOverview();
  const { data: profile, isLoading: profileLoading } = useGetMyProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const payMutation = usePayInstallment({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Payment successful",
          description: "Your installment has been paid.",
        });
        queryClient.invalidateQueries({ queryKey: getGetDashboardOverviewQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Payment failed",
          description: err.error || "An error occurred.",
          variant: "destructive",
        });
      }
    }
  });

  if (overviewLoading || profileLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 mx-auto space-y-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!overview || !profile) return null;

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Overview.</h1>
          <p className="text-muted-foreground">Welcome back, {profile.displayName}.</p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border px-4 py-2">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-mono text-muted-foreground">Trust Score</span>
            <span className="font-bold font-mono">{profile.trustScore}/1000</span>
          </div>
          <Badge variant="outline" className="uppercase font-mono tracking-widest bg-primary/10 text-primary border-primary/20">
            {profile.tier}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card rounded-none shadow-none border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase text-muted-foreground tracking-wider">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tighter">{formatMoney(overview.walletBalance)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card rounded-none shadow-none border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase text-muted-foreground tracking-wider">Total Lent</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tighter">{formatMoney(overview.totalLent)}</div>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">{formatMoney(overview.activeLending)} ACTIVE</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card rounded-none shadow-none border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase text-muted-foreground tracking-wider">Total Borrowed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tighter">{formatMoney(overview.totalBorrowed)}</div>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">{formatMoney(overview.activeBorrowing)} ACTIVE</p>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-none shadow-none border-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono uppercase text-muted-foreground tracking-wider">Est. Yield</CardTitle>
            <AlertCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono tracking-tighter text-primary">{formatPercentage(overview.portfolioYield)}</div>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">{formatMoney(overview.expectedReturns)} RETURN</p>
          </CardContent>
        </Card>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Payments */}
        <Card className="bg-card rounded-none shadow-none border-border flex flex-col h-[500px]">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-mono uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {overview.upcomingPayments.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All caught up"
                description="No upcoming payments scheduled."
                className="h-full border-0"
              />
            ) : (
              <div className="divide-y divide-border">
                {overview.upcomingPayments.map((payment) => (
                  <div key={payment.installmentId} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div>
                      <Link href={`/loans/${payment.loanId}`} className="font-bold hover:underline mb-1 block">
                        {payment.loanTitle}
                      </Link>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 font-mono">
                        <span>Due {formatDate(payment.dueDate)}</span>
                        <span>•</span>
                        <span className={payment.role === 'borrower' ? 'text-destructive' : 'text-primary'}>
                          {payment.role === 'borrower' ? 'YOU OWE' : 'YOU RECEIVE'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="font-bold font-mono text-lg">{formatMoney(payment.amount)}</div>
                      {payment.role === 'borrower' && (
                        <Button 
                          size="sm" 
                          className="rounded-none font-bold tracking-tight bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => payMutation.mutate({ installmentId: payment.installmentId })}
                          disabled={payMutation.isPending}
                        >
                          PAY NOW
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity / Shortcuts placeholder for symmetry */}
        <Card className="bg-card rounded-none shadow-none border-border flex flex-col h-[500px]">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-mono uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col gap-4">
            <Link href="/marketplace" className="flex items-center justify-between p-4 border border-border hover:border-primary transition-colors group">
              <div>
                <div className="font-bold text-lg mb-1">Browse Marketplace</div>
                <div className="text-sm text-muted-foreground">Find loans to fund and earn yield</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            
            <Link href="/borrow" className="flex items-center justify-between p-4 border border-border hover:border-primary transition-colors group">
              <div>
                <div className="font-bold text-lg mb-1">Request a Loan</div>
                <div className="text-sm text-muted-foreground">Set your terms and get funded</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            
            <Link href="/wallet" className="flex items-center justify-between p-4 border border-border hover:border-primary transition-colors group">
              <div>
                <div className="font-bold text-lg mb-1">Manage Wallet</div>
                <div className="text-sm text-muted-foreground">Deposit funds or withdraw earnings</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <DonationCard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
