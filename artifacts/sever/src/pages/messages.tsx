import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListConversations,
  useGetConversation,
  useSendDirectMessage,
  getGetConversationQueryKey,
  getListConversationsQueryKey,
  useGetDmUnreadCount,
} from "@workspace/api-client-react";
import { useGetMyProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / 3600000;
  if (diffHrs < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface ThreadProps {
  userId: string;
  username: string;
  myId: string;
  onBack: () => void;
}

function Thread({ userId, username, myId, onBack }: ThreadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const { data: messages, isLoading } = useGetConversation(userId, {
    query: { queryKey: getGetConversationQueryKey(userId), refetchInterval: 5000 },
  });

  const sendMutation = useSendDirectMessage({
    mutation: {
      onSuccess: () => {
        setDraft("");
        queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(userId) });
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      },
      onError: () => toast({ title: "Send failed", variant: "destructive" }),
    },
  });

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMutation.mutate({ userId, data: { content: draft.trim() } });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-none shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono font-semibold text-sm">{username}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-3/4" />)
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isMe = msg.fromUserId === myId;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] px-3 py-2 text-sm font-mono rounded-sm",
                    isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border border-border text-foreground",
                  )}
                >
                  <p className="break-words">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1 text-right", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm font-mono">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            No messages yet. Say hello!
          </div>
        )}
      </div>

      <form onSubmit={send} className="p-4 border-t border-border flex gap-2">
        <Input
          className="font-mono rounded-none flex-1"
          placeholder="Type a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          disabled={sendMutation.isPending}
        />
        <Button type="submit" size="icon" className="rounded-none h-10 w-10 shrink-0" disabled={!draft.trim() || sendMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export function Messages({ initialUserId }: { initialUserId?: string }) {
  const [, setLocation] = useLocation();
  const [activeUserId, setActiveUserId] = useState<string | null>(initialUserId ?? null);
  const [activeUsername, setActiveUsername] = useState<string>("");

  const { data: profile } = useGetMyProfile();
  const { data: conversations, isLoading } = useListConversations({
    query: { queryKey: getListConversationsQueryKey(), refetchInterval: 10000 },
  });

  if (activeUserId && profile) {
    return (
      <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)]">
        <Thread
          userId={activeUserId}
          username={activeUsername}
          myId={profile.id}
          onBack={() => setActiveUserId(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} className="h-8 w-8 rounded-none">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold font-mono uppercase tracking-tight">Messages</h1>
          <p className="text-xs text-muted-foreground font-mono">Direct messages with other users</p>
        </div>
      </div>

      <Card className="rounded-none border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <ul className="divide-y divide-border">
              {conversations.map((c) => (
                <li key={c.userId}>
                  <button
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
                    onClick={() => { setActiveUserId(c.userId); setActiveUsername(c.username); }}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-sm">{c.username}</span>
                        <span className="text-xs text-muted-foreground font-mono">{formatTime(c.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{c.lastMessage}</p>
                    </div>
                    {c.unreadCount > 0 && (
                      <Badge className="shrink-0 ml-1 h-5 min-w-5 rounded-full text-[10px] font-bold">
                        {c.unreadCount}
                      </Badge>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-mono text-sm">No conversations yet</p>
              <p className="font-mono text-xs mt-1 opacity-60">Message a borrower from their loan page</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
