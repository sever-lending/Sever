import { Router, type IRouter, type Request, type Response } from "express";
import { db, platformUpdatesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

function isAdmin(req: Request): boolean {
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!adminUserId) return false;
  return req.isAuthenticated() && req.user.id === adminUserId;
}

router.get("/updates", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db
    .select()
    .from(platformUpdatesTable)
    .where(eq(platformUpdatesTable.published, true))
    .orderBy(desc(platformUpdatesTable.pinned), desc(platformUpdatesTable.createdAt))
    .limit(50);
  res.json({ updates: rows });
});

router.get("/admin/updates", async (req: Request, res: Response): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(!req.isAuthenticated() ? 401 : 403).json({ error: "Forbidden" });
    return;
  }
  const rows = await db
    .select()
    .from(platformUpdatesTable)
    .orderBy(desc(platformUpdatesTable.createdAt))
    .limit(100);
  res.json({ updates: rows });
});

router.post("/admin/updates", async (req: Request, res: Response): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(!req.isAuthenticated() ? 401 : 403).json({ error: "Forbidden" });
    return;
  }
  const { title, body, kind, published, pinned } = req.body;
  if (!title?.trim() || !body?.trim()) {
    res.status(400).json({ error: "Title and body are required" });
    return;
  }
  const validKinds = ["announcement", "feature", "fix", "maintenance"];
  const safeKind = validKinds.includes(kind) ? kind : "announcement";
  const [row] = await db
    .insert(platformUpdatesTable)
    .values({
      title: String(title).trim().slice(0, 200),
      body: String(body).trim(),
      kind: safeKind,
      published: Boolean(published),
      pinned: Boolean(pinned),
    })
    .returning();
  res.status(201).json(row);
});

router.patch("/admin/updates/:id", async (req: Request, res: Response): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(!req.isAuthenticated() ? 401 : 403).json({ error: "Forbidden" });
    return;
  }
  const { id } = req.params;
  const updates: Partial<{ title: string; body: string; kind: string; published: boolean; pinned: boolean }> = {};
  if (req.body.title !== undefined) updates.title = String(req.body.title).trim().slice(0, 200);
  if (req.body.body !== undefined) updates.body = String(req.body.body).trim();
  if (req.body.kind !== undefined) {
    const validKinds = ["announcement", "feature", "fix", "maintenance"];
    updates.kind = validKinds.includes(req.body.kind) ? req.body.kind : "announcement";
  }
  if (req.body.published !== undefined) updates.published = Boolean(req.body.published);
  if (req.body.pinned !== undefined) updates.pinned = Boolean(req.body.pinned);

  const [row] = await db
    .update(platformUpdatesTable)
    .set(updates)
    .where(eq(platformUpdatesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/admin/updates/:id", async (req: Request, res: Response): Promise<void> => {
  if (!isAdmin(req)) {
    res.status(!req.isAuthenticated() ? 401 : 403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(platformUpdatesTable).where(eq(platformUpdatesTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
