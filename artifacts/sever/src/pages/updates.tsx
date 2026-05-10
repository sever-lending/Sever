import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, Zap, Wrench, AlertTriangle, Pin } from "lucide-react";

interface Update {
  id: string;
  title: string;
  body: string;
  kind: string;
  published: boolean;
  pinned: boolean;
  createdAt: string;
}

const KIND_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  announcement: { label: "Announcement", icon: Megaphone, color: "text-primary border-primary/40 bg-primary/5" },
  feature: { label: "New Feature", icon: Zap, color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/5" },
  fix: { label: "Bug Fix", icon: Wrench, color: "text-blue-400 border-blue-500/40 bg-blue-500/5" },
  maintenance: { label: "Maintenance", icon: AlertTriangle, color: "text-orange-400 border-orange-500/40 bg-orange-500/5" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Updates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/updates`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { updates: [] })
      .then((d) => setUpdates(d.updates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-12 px-4 md:px-6 mx-auto max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">What's New</h1>
        <p className="text-muted-foreground mt-2">Stay up to date with the latest improvements and announcements from the Sever team.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium">No updates yet</p>
          <p className="text-xs text-muted-foreground mt-1">Check back soon for news and new features.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/60 ml-[7px]" />
          <div className="space-y-10 pl-8">
            {updates.map((u) => {
              const cfg = KIND_CONFIG[u.kind] ?? KIND_CONFIG.announcement;
              const Icon = cfg.icon;
              return (
                <div key={u.id} className="relative">
                  <div className={`absolute -left-8 mt-1 h-3.5 w-3.5 rounded-full border-2 border-background ring-1 ${u.pinned ? "ring-primary bg-primary" : "ring-border bg-muted"}`} />
                  <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-border/80 transition-colors">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={`gap-1 text-xs ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                      {u.pinned && (
                        <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/40 bg-primary/5">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">{formatDate(u.createdAt)}</span>
                    </div>
                    <h2 className="text-lg font-semibold leading-snug">{u.title}</h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{u.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
