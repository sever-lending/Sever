import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request } from "express";

export function isOwner(req: Request): boolean {
  const ownerId = process.env.ADMIN_USER_ID;
  return !!ownerId && req.isAuthenticated() && req.user.id === ownerId;
}

export async function isAdmin(req: Request): Promise<boolean> {
  if (!req.isAuthenticated()) return false;
  if (isOwner(req)) return true;
  const [row] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.userId, req.user.id));
  return !!row;
}

export function deny(req: Request, res: { status: (c: number) => { json: (b: unknown) => void } }): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
}
