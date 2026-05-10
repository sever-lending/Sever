import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MessageSquarePlus } from "lucide-react";

interface FeedbackItem {
  id: string; userId: string | null; name: string | null;
  email: string | null; subject: string | null; message: string; createdAt: string;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function TabFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/admin/feedback`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setFeedback(d.feedback ?? []); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Inbox — {feedback.length} message{feedback.length !== 1 ? "s" : ""}
      </p>
      {feedback.length === 0 ? (
        <div className="rounded-lg border border-border p-16 text-center">
          <MessageSquarePlus className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No messages yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Submissions from the Support page appear here.</p>
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
  );
}
