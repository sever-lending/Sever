import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import {
  ListNotificationsQueryParams,
  ListNotificationsResponse,
  GetUnreadNotificationCountResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapNotif(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    read: n.read === "true",
    createdAt: n.createdAt.toISOString(),
    loanId: n.loanId,
  };
}

router.get("/notifications", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const qp = ListNotificationsQueryParams.safeParse(req.query);
  const unreadOnly = qp.success ? qp.data.unreadOnly : false;

  const conds = [eq(notificationsTable.userId, req.user.id)];
  if (unreadOnly) conds.push(eq(notificationsTable.read, "false"));

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(and(...conds))
    .orderBy(sql`${notificationsTable.createdAt} desc`)
    .limit(50);

  res.json(ListNotificationsResponse.parse(rows.map(mapNotif)));
});

router.get("/notifications/unread-count", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.userId, req.user.id),
        eq(notificationsTable.read, "false"),
      ),
    );
  res.json(GetUnreadNotificationCountResponse.parse({ count: row?.count ?? 0 }));
});

router.post("/notifications/read-all", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const result = await db
    .update(notificationsTable)
    .set({ read: "true" })
    .where(
      and(
        eq(notificationsTable.userId, req.user.id),
        eq(notificationsTable.read, "false"),
      ),
    )
    .returning({ id: notificationsTable.id });
  res.json(
    MarkAllNotificationsReadResponse.parse({ updated: result.length }),
  );
});

router.patch(
  "/notifications/:notificationId/read",
  async (req, res): Promise<void> => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const params = MarkNotificationReadParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [updated] = await db
      .update(notificationsTable)
      .set({ read: "true" })
      .where(
        and(
          eq(notificationsTable.id, params.data.notificationId),
          eq(notificationsTable.userId, req.user.id),
        ),
      )
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(MarkNotificationReadResponse.parse(mapNotif(updated)));
  },
);

export default router;
