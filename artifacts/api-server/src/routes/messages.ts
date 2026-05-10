import { Router, type IRouter } from "express";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { assertClean } from "../lib/contentFilter";
import {
  db,
  loanMessagesTable,
  directMessagesTable,
  loansTable,
  profilesTable,
} from "@workspace/db";
import {
  ListLoanMessagesResponse,
  ListConversationsResponse,
  GetConversationResponse,
} from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

const ContentBody = z.object({ content: z.string().min(1).max(1000) });

function displayHandle(profile: { username: string | null; displayName: string }) {
  return profile.username ? `@${profile.username}` : profile.displayName;
}

router.get("/loans/:id/messages", async (req, res): Promise<void> => {
  const loanId = req.params.id;
  const [loan] = await db.select().from(loansTable).where(eq(loansTable.id, loanId));
  if (!loan) { res.status(404).json({ error: "Loan not found" }); return; }

  const rows = await db
    .select({
      id: loanMessagesTable.id,
      loanId: loanMessagesTable.loanId,
      senderId: loanMessagesTable.senderId,
      content: loanMessagesTable.content,
      createdAt: loanMessagesTable.createdAt,
      username: profilesTable.username,
      displayName: profilesTable.displayName,
    })
    .from(loanMessagesTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, loanMessagesTable.senderId))
    .where(eq(loanMessagesTable.loanId, loanId))
    .orderBy(asc(loanMessagesTable.createdAt))
    .limit(200);

  const items = rows.map((r) => ({
    id: r.id,
    loanId: r.loanId,
    senderId: r.senderId,
    senderUsername: displayHandle({ username: r.username ?? null, displayName: r.displayName ?? "Unknown" }),
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));
  res.json(ListLoanMessagesResponse.parse(items));
});

router.post("/loans/:id/messages", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const loanId = req.params.id;
  const parsed = ContentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Content required (1-1000 chars)" }); return; }
  const msgErr = assertClean(parsed.data.content, "Message");
  if (msgErr) { res.status(400).json({ error: msgErr }); return; }

  const [loan] = await db.select().from(loansTable).where(eq(loansTable.id, loanId));
  if (!loan) { res.status(404).json({ error: "Loan not found" }); return; }

  const [row] = await db
    .insert(loanMessagesTable)
    .values({ loanId, senderId: req.user.id, content: parsed.data.content })
    .returning();

  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, req.user.id));
  res.status(201).json({
    id: row.id,
    loanId: row.loanId,
    senderId: row.senderId,
    senderUsername: displayHandle({ username: profile?.username ?? null, displayName: profile?.displayName ?? "Unknown" }),
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  });
});

router.get("/messages/conversations", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const userId = req.user.id;

  const sent = await db
    .select({ partnerId: directMessagesTable.toUserId, lastMsg: directMessagesTable.content, lastAt: directMessagesTable.createdAt })
    .from(directMessagesTable)
    .where(eq(directMessagesTable.fromUserId, userId))
    .orderBy(desc(directMessagesTable.createdAt));

  const received = await db
    .select({ partnerId: directMessagesTable.fromUserId, lastMsg: directMessagesTable.content, lastAt: directMessagesTable.createdAt })
    .from(directMessagesTable)
    .where(eq(directMessagesTable.toUserId, userId))
    .orderBy(desc(directMessagesTable.createdAt));

  const latest = new Map<string, { lastMessage: string; lastMessageAt: Date }>();
  for (const r of [...sent, ...received]) {
    const existing = latest.get(r.partnerId);
    if (!existing || r.lastAt > existing.lastMessageAt) {
      latest.set(r.partnerId, { lastMessage: r.lastMsg, lastMessageAt: r.lastAt });
    }
  }

  const unreadCounts = await db
    .select({ fromUserId: directMessagesTable.fromUserId })
    .from(directMessagesTable)
    .where(and(eq(directMessagesTable.toUserId, userId), eq(directMessagesTable.read, false)));

  const unreadMap = new Map<string, number>();
  for (const r of unreadCounts) {
    unreadMap.set(r.fromUserId, (unreadMap.get(r.fromUserId) ?? 0) + 1);
  }

  if (latest.size === 0) { res.json([]); return; }
  const partnerIds = [...latest.keys()];
  const profiles = await db
    .select({ userId: profilesTable.userId, username: profilesTable.username, displayName: profilesTable.displayName })
    .from(profilesTable)
    .where(or(...partnerIds.map((id) => eq(profilesTable.userId, id))));

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));

  const conversations = partnerIds
    .map((pid) => {
      const prof = profileMap.get(pid);
      const info = latest.get(pid)!;
      return {
        userId: pid,
        username: displayHandle({ username: prof?.username ?? null, displayName: prof?.displayName ?? "Unknown" }),
        lastMessage: info.lastMessage,
        lastMessageAt: info.lastMessageAt.toISOString(),
        unreadCount: unreadMap.get(pid) ?? 0,
      };
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  res.json(ListConversationsResponse.parse(conversations));
});

router.get("/messages/unread-count", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const rows = await db
    .select({ id: directMessagesTable.id })
    .from(directMessagesTable)
    .where(and(eq(directMessagesTable.toUserId, req.user.id), eq(directMessagesTable.read, false)));
  res.json({ count: rows.length });
});

router.get("/messages/:userId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const me = req.user.id;
  const other = req.params.userId;

  await db
    .update(directMessagesTable)
    .set({ read: true })
    .where(and(eq(directMessagesTable.fromUserId, other), eq(directMessagesTable.toUserId, me)));

  const rows = await db
    .select()
    .from(directMessagesTable)
    .where(
      or(
        and(eq(directMessagesTable.fromUserId, me), eq(directMessagesTable.toUserId, other)),
        and(eq(directMessagesTable.fromUserId, other), eq(directMessagesTable.toUserId, me)),
      ),
    )
    .orderBy(asc(directMessagesTable.createdAt))
    .limit(200);

  const profiles = await db
    .select({ userId: profilesTable.userId, username: profilesTable.username, displayName: profilesTable.displayName })
    .from(profilesTable)
    .where(or(eq(profilesTable.userId, me), eq(profilesTable.userId, other)));
  const profMap = new Map(profiles.map((p) => [p.userId, p]));

  const items = rows.map((r) => {
    const fp = profMap.get(r.fromUserId);
    const tp = profMap.get(r.toUserId);
    return {
      id: r.id,
      fromUserId: r.fromUserId,
      toUserId: r.toUserId,
      fromUsername: displayHandle({ username: fp?.username ?? null, displayName: fp?.displayName ?? "Unknown" }),
      toUsername: displayHandle({ username: tp?.username ?? null, displayName: tp?.displayName ?? "Unknown" }),
      content: r.content,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    };
  });
  res.json(GetConversationResponse.parse(items));
});

router.post("/messages/:userId", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const parsed = ContentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Content required (1-1000 chars)" }); return; }
  const dmErr = assertClean(parsed.data.content, "Message");
  if (dmErr) { res.status(400).json({ error: dmErr }); return; }
  const me = req.user.id;
  const toUserId = req.params.userId;
  if (me === toUserId) { res.status(400).json({ error: "Cannot message yourself" }); return; }

  const [row] = await db
    .insert(directMessagesTable)
    .values({ fromUserId: me, toUserId, content: parsed.data.content })
    .returning();

  const profiles = await db
    .select({ userId: profilesTable.userId, username: profilesTable.username, displayName: profilesTable.displayName })
    .from(profilesTable)
    .where(or(eq(profilesTable.userId, me), eq(profilesTable.userId, toUserId)));
  const profMap = new Map(profiles.map((p) => [p.userId, p]));
  const fp = profMap.get(me);
  const tp = profMap.get(toUserId);

  res.status(201).json({
    id: row.id,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    fromUsername: displayHandle({ username: fp?.username ?? null, displayName: fp?.displayName ?? "Unknown" }),
    toUsername: displayHandle({ username: tp?.username ?? null, displayName: tp?.displayName ?? "Unknown" }),
    content: row.content,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  });
});

export default router;
