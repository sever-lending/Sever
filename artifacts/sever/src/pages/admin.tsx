import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Users, Activity, AlertCircle, BarChart3, ArrowUpRight, Clock, MessageSquarePlus, Megaphone, Plus, Trash2, Eye, EyeOff, Pin, PinOff } from "lucide-react";

interface PlatformUpdate {
  id: string;
  title: string;
  body: string;
  kind: string;
  published: boolean;
  pinned: boolean;
  createdAt: string;
}

interface FeedbackItem {
  id: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  createdAt: string;
}

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

const KIND_LABELS: Record<string, string> = {
  announcement: "Announcement",
  feature: "New Feature",
  fix: "Bug Fix",
  maintenance: "Maintenance",
};

export function Admin() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
  const [newUpdate, setNewUpdate] = useState({ title: "", body: "", kind: "announcement", published: true, pinned: false });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const fetchUpdates = () => {
    fetch(`${import.meta.env.BASE_URL}api/admin/updates`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUpdates(d.updates ?? []); })
      .catch(() => {});
  };

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

    fetch(`${import.meta.env.BASE_URL}api/admin/feedback`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setFeedback(d.feedback ?? []); })
      .catch(() => {});

    fetchUpdates();
  }, []);

  async function handlePostUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUpdate.title.trim() || !newUpdate.body.trim()) return;
    setPosting(true);
    setPostError(null);
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/admin/updates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUpdate),
      });
      if (!r.ok) {
        const d = await r.json();
        setPostError(d.error ?? "Failed to post update");
      } else {
        setNewUpdate({ title: "", body: "", kind: "announcement", published: true, pinned: false });
        fetchUpdates();
      }
    } catch {
      setPostError("Network error");
    } finally {
      setPosting(false);
    }
  }

  async function toggleField(id: string, field: "published" | "pinned", value: boolean) {
    await fetch(`${import.meta.env.BASE_URL}api/admin/updates/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    fetchUpdates();
  }

  async function deleteUpdate(id: string) {
    if (!confirm("Delete this update?")) return;
    await fetch(`${import.meta.env.BASE_URL}api/admin/updates/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchUpdates();
  }

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

      {/* Platform Updates Management */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          Platform Updates
        </h2>

        {/* Create new update form */}
        <form onSubmit={handlePostUpdate} className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-4 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Post New Update</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary col-span-full"
              placeholder="Title"
              value={newUpdate.title}
              maxLength={200}
              onChange={(e) => setNewUpdate((p) => ({ ...p, title: e.target.value }))}
              required
            />
            <textarea
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary col-span-full resize-none"
              placeholder="Body — describe what changed, what's new, or any announcements…"
              rows={4}
              value={newUpdate.body}
              onChange={(e) => setNewUpdate((p) => ({ ...p, body: e.target.value }))}
              required
            />
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={newUpdate.kind}
              onChange={(e) => setNewUpdate((p) => ({ ...p, kind: e.target.value }))}
            >
              <option value="announcement">Announcement</option>
              <option value="feature">New Feature</option>
              <option value="fix">Bug Fix</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newUpdate.published} onChange={(e) => setNewUpdate((p) => ({ ...p, published: e.target.checked }))} className="rounded" />
                Publish immediately
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newUpdate.pinned} onChange={(e) => setNewUpdate((p) => ({ ...p, pinned: e.target.checked }))} className="rounded" />
                Pin to top
              </label>
            </div>
          </div>
          {postError && <p className="text-xs text-destructive">{postError}</p>}
          <Button type="submit" size="sm" disabled={posting} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {posting ? "Posting…" : "Post Update"}
          </Button>
        </form>

        {/* Existing updates list */}
        {updates.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">No updates yet.</div>
        ) : (
          <div className="space-y-2">
            {updates.map((u) => (
              <div key={u.id} className={`rounded-lg border p-4 space-y-1.5 ${u.published ? "border-border bg-card" : "border-dashed border-border/50 bg-muted/10 opacity-70"}`}>
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">{KIND_LABELS[u.kind] ?? u.kind}</Badge>
                      {u.pinned && <Badge variant="outline" className="text-xs text-primary border-primary/40">Pinned</Badge>}
                      {!u.published && <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>}
                      <span className="text-xs text-muted-foreground">{timeAgo(u.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold truncate">{u.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">{u.body}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title={u.published ? "Unpublish" : "Publish"}
                      onClick={() => toggleField(u.id, "published", !u.published)}
                    >
                      {u.published ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title={u.pinned ? "Unpin" : "Pin"}
                      onClick={() => toggleField(u.id, "pinned", !u.pinned)}
                    >
                      {u.pinned ? <Pin className="h-3.5 w-3.5 text-primary" /> : <PinOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => deleteUpdate(u.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Inbox */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Feedback &amp; Questions ({feedback.length})
        </h2>
        {feedback.length === 0 ? (
          <div className="rounded-lg border border-border p-12 text-center">
            <MessageSquarePlus className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Submissions from the Support page will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedback.map((fb) => (
              <div key={fb.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {fb.subject ? (
                      <span className="font-semibold">{fb.subject}</span>
                    ) : (
                      <span className="text-muted-foreground italic">No subject</span>
                    )}
                    {fb.name && <Badge variant="outline" className="text-xs">{fb.name}</Badge>}
                    {fb.email && (
                      <a href={`mailto:${fb.email}`} className="text-primary text-xs hover:underline">{fb.email}</a>
                    )}
                    {fb.userId && (
                      <Badge variant="secondary" className="text-xs font-mono">{fb.userId.slice(0, 10)}…</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(fb.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{fb.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
