import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign } from "lucide-react";

interface RevenueData {
  revenue: {
    total: number; count: number; originationFees: number; lateFees: number; other: number;
    byKind: { kind: string; total: number; count: number }[];
  };
  platform: { totalVolume: number };
  transactions: { id: string; kind: string; amount: number; loanId: string | null; createdAt: string }[];
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const KIND_LABEL: Record<string, string> = { origination_fee: "Origination Fee", late_fee: "Late Fee" };

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function TabRevenue() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/revenue`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4"><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div><Skeleton className="h-64" /></div>;
  if (!data) return <div className="text-sm text-muted-foreground">Failed to load revenue data.</div>;

  const { revenue, platform, transactions } = data;
  const margin = platform.totalVolume > 0 ? ((revenue.total / platform.totalVolume) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="text-xs text-muted-foreground font-medium mb-1">Total Platform Revenue</div>
          <div className="text-2xl font-bold text-primary">{fmt(revenue.total)}</div>
          <div className="text-xs text-muted-foreground mt-1">{revenue.count} events</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium mb-1">Take Rate</div>
          <div className="text-2xl font-bold">{margin}%</div>
          <div className="text-xs text-muted-foreground mt-1">of {fmt(platform.totalVolume)} volume</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-medium mb-1">Other</div>
          <div className="text-2xl font-bold">{fmt(revenue.other)}</div>
          <div className="text-xs text-muted-foreground mt-1">miscellaneous revenue</div>
        </div>
      </div>

      {/* By kind */}
      {revenue.byKind.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Breakdown by Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {revenue.byKind.map((item) => (
              <div key={item.kind} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                <div>
                  <div className="text-sm font-medium">{KIND_LABEL[item.kind] ?? item.kind}</div>
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

      {/* Full transaction ledger */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Transaction Ledger ({transactions.length})</p>
        {transactions.length === 0 ? (
          <div className="rounded-lg border border-border p-12 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No revenue events yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Loan ID</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">When</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t.id} className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={t.kind === "origination_fee" ? "border-primary/40 text-primary text-xs" : "border-orange-500/40 text-orange-400 text-xs"}>
                        {KIND_LABEL[t.kind] ?? t.kind}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">
                      {t.loanId ? t.loanId.slice(0, 8) + "…" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">+{fmt(t.amount)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">{timeAgo(t.createdAt)}</td>
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
