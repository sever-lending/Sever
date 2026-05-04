import { db, notificationsTable } from "@workspace/db";

type NotifKind =
  | "loan_funded"
  | "loan_fully_funded"
  | "repayment_received"
  | "loan_repaid"
  | "payment_due_soon"
  | "payment_overdue";

interface NotifyPayload {
  userId: string;
  loanId?: string | null;
  kind: NotifKind;
  title: string;
  body: string;
}

export async function notify(
  payload: NotifyPayload | NotifyPayload[],
  tx?: typeof db,
) {
  const client = tx ?? db;
  const items = Array.isArray(payload) ? payload : [payload];
  if (items.length === 0) return;
  await client.insert(notificationsTable).values(
    items.map((n) => ({
      userId: n.userId,
      loanId: n.loanId ?? null,
      kind: n.kind,
      title: n.title,
      body: n.body,
      read: "false",
    })),
  );
}
