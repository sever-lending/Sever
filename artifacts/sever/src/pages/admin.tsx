import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, Users, Activity, AlertCircle, BarChart3, ArrowUpRight, Clock } from "lucide-react";

interface RevenueData {
  revenue: {
    total: number;
    count: number;
    originationFees: number;
    lateFees: number;
    other: number;
    byKind: { kind: string; total: number; count: number }[];
  };
  platform: {
    totalUsers: number;
    totalLoans: number;
    totalVolume: number;
    openLoans: number;
    activeLoans: number;
    repaidLoans: number;
    totalDeployed: number;
    uniqueLenders: number;
  };
  transactions: {
    id: string;
    kind: string;
    amount: number;
    loanId: string | null;
    createdAt: string;
  }[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtKind(kind: string) {
  const map: Record<string, string> = {
    origination_fee: "Origination Fee",
    late_fee: "Late Fee",
  };
  return map[kind] ?? kind;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Admin() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/revenue`, {
      credentials: "include",
    })
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          window.location.href = `${import.meta.env.BASE_URL}admin-login`;
          return null;
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6 mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-8 px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load admin data: {error}</span>
        </div>
      </div>
    );
  }

  const { revenue, platform, transactions } = data;
  const margin = platform.totalVolume > 0 ? ((revenue.total / platform.totalVolume) * 100).toFixed(2) : "0.00";

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform revenue & business metrics</p>
        </div>
        <Badge variant="outline" className="border-primary text-primary px-3 py-1 text-xs font-mono">
          OWNER VIEW
        </Badge>
      </div>

      {/* Revenue KPIs */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Platform Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{fmt(revenue.total)}</div>
              <div className="text-xs text-muted-foreground mt-1">{revenue.count} revenue events</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Origination Fees</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(revenue.originationFees)}</div>
              <div className="text-xs text-muted-foreground mt-1">1.5% on funded loans</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Late Fees</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(revenue.lateFees)}</div>
              <div className="text-xs text-muted-foreground mt-1">50% of $5 + 2% per installment</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Take Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{margin}%</div>
              <div className="text-xs text-muted-foreground mt-1">of total loan volume</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform KPIs */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Platform Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platform.totalUsers}</div>
              <div className="text-xs text-muted-foreground mt-1">{platform.uniqueLenders} active lenders</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loan Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(platform.totalVolume)}</div>
              <div className="text-xs text-muted-foreground mt-1">{platform.totalLoans} total loans</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Capital Deployed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(platform.totalDeployed)}</div>
              <div className="text-xs text-muted-foreground mt-1">{platform.activeLoans} loans repaying</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loan Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platform.openLoans}</div>
              <div className="text-xs text-muted-foreground mt-1">
                seeking funding · {platform.repaidLoans} fully repaid
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Breakdown */}
      {revenue.byKind.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Revenue Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {revenue.byKind.map((item) => (
              <div key={item.kind} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                <div>
                  <div className="text-sm font-medium">{fmtKind(item.kind)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.count} events</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{fmt(item.total)}</div>
                  <div className="text-xs text-muted-foreground">
                    {revenue.total > 0 ? ((item.total / revenue.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Revenue Events</h2>
        {transactions.length === 0 ? (
          <div className="rounded-lg border border-border p-12 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No revenue events yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Revenue is recorded when loans are funded or late fees are charged.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Loan ID</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">When</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={t.kind === "origination_fee" ? "border-primary/40 text-primary" : "border-orange-500/40 text-orange-400"}
                      >
                        {fmtKind(t.kind)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">
                      {t.loanId ? t.loanId.slice(0, 8) + "…" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">
                      +{fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      {timeAgo(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
