import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, UserPlus, Trash2, ShieldCheck } from "lucide-react";

interface AdminEntry {
  userId: string;
  addedBy: string | null;
  addedAt: string;
  displayName: string | null;
  username: string | null;
}

interface Props { isOwner: boolean; }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function TabAccess({ isOwner }: Props) {
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const fetch_ = () => {
    fetch(`${import.meta.env.BASE_URL}api/admin/admins`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) { setAdmins(d.admins ?? []); setOwnerUserId(d.ownerUserId ?? null); } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, []);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setAdding(true); setAddError(null); setAddSuccess(null);
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/admin/admins`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim() }),
      });
      const d = await r.json();
      if (!r.ok) setAddError(d.error ?? "Failed to add admin");
      else { setAddSuccess(`${d.displayName} has been granted admin access.`); setUserId(""); fetch_(); }
    } catch { setAddError("Network error"); }
    finally { setAdding(false); }
  }

  async function removeAdmin(id: string) {
    if (!confirm("Remove this admin? They will lose access immediately.")) return;
    await fetch(`${import.meta.env.BASE_URL}api/admin/admins/${id}`, { method: "DELETE", credentials: "include" });
    fetch_();
  }

  if (loading) return <div className="text-sm text-muted-foreground py-8">Loading…</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Owner card */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Owner</p>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
          <Crown className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">You (account owner)</div>
            {ownerUserId && (
              <div className="text-xs font-mono text-muted-foreground mt-0.5">{ownerUserId.slice(0, 16)}…</div>
            )}
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30 shrink-0">Owner</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          The owner account is set via the <code className="bg-muted px-1 rounded text-[10px]">ADMIN_USER_ID</code> environment variable and cannot be removed.
        </p>
      </div>

      {/* Additional admins */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Additional Admins ({admins.length})
        </p>
        {admins.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
            No additional admins. Add someone below.
          </div>
        ) : (
          <div className="space-y-2">
            {admins.map((a) => (
              <div key={a.userId} className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.displayName ?? "Unknown User"}</div>
                  {a.username && <div className="text-xs text-muted-foreground">@{a.username}</div>}
                  <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">{a.userId.slice(0, 16)}…</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">Added {formatDate(a.addedAt)}</div>
                  {isOwner && a.userId !== ownerUserId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                      onClick={() => removeAdmin(a.userId)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add admin form — owner only */}
      {isOwner && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Grant Admin Access</p>
          <form onSubmit={addAdmin} className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">User ID</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Paste the user's Replit user ID…"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Ask the person to sign in, then find their User ID in the Users tab above.
              </p>
            </div>
            {addError && <p className="text-xs text-destructive">{addError}</p>}
            {addSuccess && <p className="text-xs text-emerald-400">{addSuccess}</p>}
            <Button type="submit" size="sm" disabled={adding} className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              {adding ? "Adding…" : "Grant Access"}
            </Button>
          </form>
          <div className="mt-3 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
            <p className="text-xs text-orange-400">
              <strong>Important:</strong> Admins can view all user data, all loans, revenue, and post platform updates. Only grant access to people you fully trust. Admins cannot add or remove other admins — only the owner can.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
