import { useState, useEffect, useRef } from "react";
import {
  useListLoanMessages,
  usePostLoanMessage,
  getListLoanMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  loanId: string;
  myId?: string;
  myUsername?: string | null;
  isAuthenticated: boolean;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 3600000) {
    const m = Math.floor(diffMs / 60000);
    return m <= 0 ? "just now" : `${m}m ago`;
  }
  if (diffMs < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function LoanChat({ loanId, myId, isAuthenticated }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useListLoanMessages(loanId, {
    query: {
      queryKey: getListLoanMessagesQueryKey(loanId),
      refetchInterval: 8000,
    },
  });

  const sendMutation = usePostLoanMessage({
    mutation: {
      onSuccess: () => {
        setDraft("");
        queryClient.invalidateQueries({ queryKey: getListLoanMessagesQueryKey(loanId) });
      },
      onError: () => toast({ title: "Could not send message", variant: "destructive" }),
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMutation.mutate({ id: loanId, data: { content: draft.trim() } });
  };

  return (
    <div className="border border-border">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="font-mono uppercase text-xs font-semibold tracking-wider">Loan Discussion</span>
        {messages && (
          <span className="ml-auto text-xs text-muted-foreground font-mono">{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3 bg-background/50">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-2/3" />)
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((msg) => {
              const isMe = msg.senderId === myId;
              return (
                <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-mono text-primary font-semibold">{msg.senderUsername}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{formatTime(msg.createdAt)}</span>
                  </div>
                  <div className={cn(
                    "max-w-[80%] px-3 py-1.5 text-sm font-mono rounded-sm",
                    isMe ? "bg-primary/20 border border-primary/30" : "bg-muted border border-border",
                  )}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs font-mono">No messages yet. Start the conversation.</p>
          </div>
        )}
      </div>

      {isAuthenticated ? (
        <form onSubmit={send} className="flex gap-2 p-3 border-t border-border">
          <Input
            className="font-mono rounded-none text-sm flex-1"
            placeholder="Ask a question or leave a comment..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            disabled={sendMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-none h-9 w-9 shrink-0"
            disabled={!draft.trim() || sendMutation.isPending}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      ) : (
        <div className="p-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Lock className="h-3.5 w-3.5" />
          Sign in to participate in the discussion.
        </div>
      )}
    </div>
  );
}
