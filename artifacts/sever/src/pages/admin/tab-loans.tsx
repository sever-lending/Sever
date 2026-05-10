import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { XCircle, Search } from "lucide-react";

interface AdminLoan {
  id: string;
  title: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  status: string;
  borrowerName: string;
  borrowerUsername: string | null;
  borrowerId: string;
  fundedAmount: number;
  fundedPct: number;
  funderCount: number;
  createdAt: string;
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const STATUSES = ["all", "open", "repaying", "repaid", "cancelled", "defaulted"] as const;

const STATUS_STYLES: Record<string, string> = {
  open: "border-primary/40 text-primary bg-primary/5",
  repaying: "border-blue-500/40 text-blue-400 bg-blue-500/5",
  repaid: "border-emerald-500/40 text-emerald-400 bg-emerald-500/5",
  cancelled: "border-border text-muted-foreground",
  defaulted: "border-red-500/40 text-red-400 bg-red-500/5",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function TabLoans() {
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchLoans = () => {
    setLoading(true);
    fetch(`${import.meta.env.BASE_URL}api/admin/loans-all`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { loans: [] })
      .then((d) => setLoans(d.loans ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  async function cancelLoan(id: string, title: string) {
    if (!confirm(`Cancel loan "${title}"? This cannot be undone.`)) return;
    setCancelling(id);
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/admin/loans/${id}/cancel`, {
        method: "POST", credentials: "include",
      });
      if (r.ok) fetchLoans();
      else {
        const d = await r.json();
        alert(d.error ?? "Failed to cancel loan");
      }
    } finally {
      setCancelling(null);
    }
  }

  const filtered = loans.filter((l) => {
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchSearch = search.trim()
      ? l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.borrowerName.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchStatus && matchSearch;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? loans.length : loans.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {s} {counts[s] > 0 && <span className="opacity-70">({counts[s]})</span>}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            className="pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary w-52"
            placeholder="Search title or borrower…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Loan</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Principal</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Rate</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-center">Funded</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-center">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No loans match this filter.</td>
                </tr>
              ) : (
                filtered.map((l, i) => (
                  <tr key={l.id} className={`border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="font-medium truncate">{l.title}</div>
                      <div className="text-xs text-muted-foreground">{l.borrowerName}{l.borrowerUsername ? ` · @${l.borrowerUsername}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{fmt(l.principal)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{l.interestRate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${l.fundedPct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{l.fundedPct.toFixed(0)}%</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{l.funderCount} funder{l.funderCount !== 1 ? "s" : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLES[l.status] ?? ""}`}>{l.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(l.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {l.status === "open" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={cancelling === l.id}
                          onClick={() => cancelLoan(l.id, l.title)}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          {cancelling === l.id ? "…" : "Cancel"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
