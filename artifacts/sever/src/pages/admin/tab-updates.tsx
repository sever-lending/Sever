import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye, EyeOff, Pin, PinOff } from "lucide-react";

interface PlatformUpdate {
  id: string; title: string; body: string; kind: string;
  published: boolean; pinned: boolean; createdAt: string;
}

const KIND_LABELS: Record<string, string> = {
  announcement: "Announcement", feature: "New Feature", fix: "Bug Fix", maintenance: "Maintenance",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function TabUpdates() {
  const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
  const [form, setForm] = useState({ title: "", body: "", kind: "announcement", published: true, pinned: false });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const fetch_ = () => {
    fetch(`${import.meta.env.BASE_URL}api/admin/updates`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setUpdates(d.updates ?? []); })
      .catch(() => {});
  };

  useEffect(() => { fetch_(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setPosting(true); setPostError(null);
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/admin/updates`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) { const d = await r.json(); setPostError(d.error ?? "Failed"); }
      else { setForm({ title: "", body: "", kind: "announcement", published: true, pinned: false }); fetch_(); }
    } catch { setPostError("Network error"); }
    finally { setPosting(false); }
  }

  async function toggle(id: string, field: "published" | "pinned", val: boolean) {
    await fetch(`${import.meta.env.BASE_URL}api/admin/updates/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
    fetch_();
  }

  async function del(id: string) {
    if (!confirm("Delete this update?")) return;
    await fetch(`${import.meta.env.BASE_URL}api/admin/updates/${id}`, { method: "DELETE", credentials: "include" });
    fetch_();
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <form onSubmit={submit} className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-4">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Post New Update</p>
        <div className="grid gap-3">
          <input
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Title (max 200 chars)"
            value={form.title} maxLength={200}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <textarea
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="Body text — describe what changed, what's new, or any announcement…"
            rows={4} value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            required
          />
          <div className="flex flex-wrap items-center gap-4">
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.kind}
              onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
            >
              <option value="announcement">Announcement</option>
              <option value="feature">New Feature</option>
              <option value="fix">Bug Fix</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))} />
              Publish immediately
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.checked }))} />
              Pin to top
            </label>
          </div>
        </div>
        {postError && <p className="text-xs text-destructive">{postError}</p>}
        <Button type="submit" size="sm" disabled={posting} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />{posting ? "Posting…" : "Post Update"}
        </Button>
      </form>

      {/* List */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          All Updates ({updates.length})
        </p>
        {updates.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">No updates yet.</div>
        ) : (
          <div className="space-y-2">
            {updates.map((u) => (
              <div key={u.id} className={`rounded-lg border p-4 ${u.published ? "border-border bg-card" : "border-dashed border-border/50 bg-muted/10 opacity-70"}`}>
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">{KIND_LABELS[u.kind] ?? u.kind}</Badge>
                      {u.pinned && <Badge variant="outline" className="text-xs text-primary border-primary/40">Pinned</Badge>}
                      {!u.published && <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>}
                      <span className="text-xs text-muted-foreground">{timeAgo(u.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold">{u.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">{u.body}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title={u.published ? "Unpublish" : "Publish"} onClick={() => toggle(u.id, "published", !u.published)}>
                      {u.published ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title={u.pinned ? "Unpin" : "Pin"} onClick={() => toggle(u.id, "pinned", !u.pinned)}>
                      {u.pinned ? <Pin className="h-3.5 w-3.5 text-primary" /> : <PinOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Delete" onClick={() => del(u.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
