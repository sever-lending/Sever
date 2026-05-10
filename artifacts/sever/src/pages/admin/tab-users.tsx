import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShieldCheck } from "lucide-react";

interface AdminUser {
  userId: string;
  displayName: string;
  username: string | null;
  walletBalance: number;
  trustScore: number;
  onTimePayments: number;
  latePayments: number;
  kycVerifiedAt: string | null;
  ageVerified: boolean;
  createdAt: string;
  openLoans: number;
  activeLoans: number;
  totalLoans: number;
  fundingCount: number;
}

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

function trustColor(score: number) {
  if (score >= 800) return "text-emerald-400";
  if (score >= 600) return "text-primary";
  if (score >= 400) return "text-yellow-400";
  return "text-red-400";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function TabUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/users`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { users: [] })
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? users.filter((u) => {
        const q = search.toLowerCase();
        return (
          u.displayName.toLowerCase().includes(q) ||
          (u.username ?? "").toLowerCase().includes(q) ||
          u.userId.toLowerCase().includes(q)
        );
      })
    : users;

  if (loading) return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-72" />
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="pl-9 pr-4 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary w-72"
            placeholder="Search by name, username, or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">Balance</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">Trust</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-center">Loans</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-center">Funded</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-center">KYC</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No users found.</td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <tr key={u.userId} className={`border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium leading-none">{u.displayName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {u.username ? `@${u.username}` : <span className="italic">no username</span>}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{u.userId.slice(0, 12)}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{fmt(u.walletBalance)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${trustColor(u.trustScore)}`}>{u.trustScore}</span>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {u.onTimePayments}✓ {u.latePayments}✗
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-semibold">{u.totalLoans}</div>
                    {(u.openLoans > 0 || u.activeLoans > 0) && (
                      <div className="text-[10px] text-muted-foreground">
                        {u.openLoans > 0 && `${u.openLoans} open`}
                        {u.openLoans > 0 && u.activeLoans > 0 && " · "}
                        {u.activeLoans > 0 && `${u.activeLoans} active`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{u.fundingCount}</td>
                  <td className="px-4 py-3 text-center">
                    {u.kycVerifiedAt ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
