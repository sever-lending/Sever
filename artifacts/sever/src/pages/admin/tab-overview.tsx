import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, TrendingUp, AlertCircle, ArrowUpRight, Clock, ShieldAlert, CheckCircle2, XCircle, BarChart3 } from "lucide-react";

interface OverviewData {
  revenue: {
    total: number;
    count: number;
    originationFees: number;
    lateFees: number;
    byKind: { kind: string; total: number; count: number }[];
    recent: { id: string; kind: string; amount: number; loanId: string | null; createdAt: string }[];
  };
  platform: {
    totalUsers: number; totalLoans: number; totalVolume: number;
    openLoans: number; activeLoans: number; repaidLoans: number;
    cancelledLoans: number; defaultedLoans: number;
    totalDeployed: number; uniqueLenders: number; overdueInstallments: number;
  };
  recentLoans: {
    id: string; title: string; principal: number; status: string;
    createdAt: string; borrowerName: string; borrowerUsername: string | null;
  }[];
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const fmtCompact = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(n);

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_STYLES: Record<string, string> = {
  open: "border-primary/40 text-primary bg-primary/5",
  repaying: "border-blue-500/40 text-blue-400 bg-blue-500/5",
  repaid: "border-emerald-500/40 text-emerald-400 bg-emerald-500/5",
  cancelled: "border-border text-muted-foreground",
  defaulted: "border-red-500/40 text-red-400 bg-red-500/5",
};

const KIND_LABEL: Record<string, string> = { origination_fee: "Origination Fee", late_fee: "Late Fee" };

export function TabOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/overview`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      <Skeleton className="h-64" />
    </div>
  );

  if (!data) return <div className="text-sm text-muted-foreground">Failed to load overview data.</div>;

  const { revenue, platform, recentLoans } = data;
  const margin = platform.totalVolume > 0 ? ((revenue.total / platform.totalVolume) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-8">
      {/* Primary KPIs */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Revenue</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{fmtCompact(revenue.total)}</div>
              <div className="text-xs text-muted-foreground mt-1">{revenue.count} revenue events</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Origination Fees</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmtCompact(revenue.originationFees)}</div>
              <div className="text-xs text-muted-foreground mt-1">1.5% on funded loans</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Late Fees</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmtCompact(revenue.lateFees)}</div>
              <div className="text-xs text-muted-foreground mt-1">50% platform share</div>
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
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Platform</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platform.totalUsers}</div>
              <div className="text-xs text-muted-foreground mt-1">{platform.uniqueLenders} lenders</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loan Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmtCompact(platform.totalVolume)}</div>
              <div className="text-xs text-muted-foreground mt-1">{platform.totalLoans} total loans</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Capital Deployed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmtCompact(platform.totalDeployed)}</div>
              <div className="text-xs text-muted-foreground mt-1">{platform.activeLoans} loans repaying</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Loans</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platform.openLoans}</div>
              <div className="text-xs text-muted-foreground mt-1">seeking funding</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risk signals */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Risk Signals</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xl font-bold">{platform.repaidLoans}</div>
              <div className="text-xs text-muted-foreground">Fully Repaid</div>
            </div>
          </div>
          <div className={`rounded-lg border bg-card p-4 flex items-center gap-3 ${platform.overdueInstallments > 0 ? "border-orange-500/40" : "border-border"}`}>
            <AlertCircle className={`h-8 w-8 shrink-0 ${platform.overdueInstallments > 0 ? "text-orange-400" : "text-muted-foreground"}`} />
            <div>
              <div className="text-xl font-bold">{platform.overdueInstallments}</div>
              <div className="text-xs text-muted-foreground">Overdue Payments</div>
            </div>
          </div>
          <div className={`rounded-lg border bg-card p-4 flex items-center gap-3 ${platform.defaultedLoans > 0 ? "border-red-500/40" : "border-border"}`}>
            <XCircle className={`h-8 w-8 shrink-0 ${platform.defaultedLoans > 0 ? "text-red-400" : "text-muted-foreground"}`} />
            <div>
              <div className="text-xl font-bold">{platform.defaultedLoans}</div>
              <div className="text-xs text-muted-foreground">Defaulted</div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-muted-foreground shrink-0" />
            <div>
              <div className="text-xl font-bold">{platform.cancelledLoans}</div>
              <div className="text-xs text-muted-foreground">Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent revenue */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Revenue</p>
          <div className="rounded-lg border border-border overflow-hidden">
            {revenue.recent.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No revenue yet.</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {revenue.recent.map((t, i) => (
                    <tr key={t.id} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={t.kind === "origination_fee" ? "border-primary/40 text-primary text-xs" : "border-orange-500/40 text-orange-400 text-xs"}>
                          {KIND_LABEL[t.kind] ?? t.kind}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-primary">+{fmt(t.amount)}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground text-xs">{timeAgo(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent loans */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Loans</p>
          <div className="rounded-lg border border-border overflow-hidden">
            {recentLoans.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No loans yet.</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recentLoans.map((l, i) => (
                    <tr key={l.id} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium truncate max-w-[160px]">{l.title}</div>
                        <div className="text-xs text-muted-foreground">{l.borrowerName}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">{fmt(l.principal)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant="outline" className={`text-xs ${STATUS_STYLES[l.status] ?? ""}`}>{l.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
