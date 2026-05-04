import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, X, CheckCheck, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import {
  useGetUnreadNotificationCount,
  useListNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  getGetUnreadNotificationCountQueryKey,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";

const KIND_ICONS: Record<string, string> = {
  loan_funded: "↗",
  loan_fully_funded: "✦",
  repayment_received: "↙",
  loan_repaid: "✓",
  payment_due_soon: "⏱",
  payment_overdue: "!",
};

const KIND_COLOR: Record<string, string> = {
  loan_funded: "text-primary",
  loan_fully_funded: "text-primary",
  repayment_received: "text-primary",
  loan_repaid: "text-primary",
  payment_due_soon: "text-amber-400",
  payment_overdue: "text-red-400",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: countData } = useGetUnreadNotificationCount({
    query: {
      queryKey: getGetUnreadNotificationCountQueryKey(),
      refetchInterval: 30_000,
    },
  });
  const unread = countData?.count ?? 0;

  const { data: notifications = [], isLoading } = useListNotifications(
    {},
    {
      query: {
        queryKey: getListNotificationsQueryKey({}),
        enabled: open,
      },
    },
  );

  const markAll = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetUnreadNotificationCountQueryKey() });
        qc.invalidateQueries({ queryKey: getListNotificationsQueryKey({}) });
      },
    },
  });

  const markOne = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetUnreadNotificationCountQueryKey() });
        qc.invalidateQueries({ queryKey: getListNotificationsQueryKey({}) });
      },
    },
  });

  function handleMarkAllRead() {
    markAll.mutate();
  }

  function handleClickNotif(id: string, isRead: boolean) {
    if (!isRead) {
      markOne.mutate({ notificationId: id });
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold tabular-nums text-primary-foreground leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] p-0 bg-card border-border/60 shadow-2xl rounded-2xl overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">Notifications</span>
            {unread > 0 && (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[10px] font-bold tabular-nums bg-primary/15 text-primary border-0"
              >
                {unread}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                onClick={handleMarkAllRead}
                disabled={markAll.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-border/30">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
              Loading…
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
              <Bell className="h-7 w-7 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nothing yet.</p>
              <p className="text-xs text-muted-foreground/60">
                You'll hear about fundings, repayments, and due dates here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "group flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-default",
                  !n.read && "bg-primary/5",
                )}
                onClick={() => handleClickNotif(n.id, n.read)}
              >
                {/* Kind icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-muted",
                    KIND_COLOR[n.kind] ?? "text-foreground",
                  )}
                >
                  {KIND_ICONS[n.kind] ?? "•"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium leading-snug",
                        !n.read ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {n.body}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                      {formatDate(n.createdAt)}
                    </span>
                    {n.loanId && (
                      <Link
                        href={`/loans/${n.loanId}`}
                        onClick={() => {
                          handleClickNotif(n.id, n.read);
                          setOpen(false);
                        }}
                        className="flex items-center gap-0.5 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View loan
                        <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
