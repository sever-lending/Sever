import { Router, type IRouter } from "express";
import { db, feedbackTable } from "@workspace/db";
import { assertClean } from "../lib/contentFilter";

const router: IRouter = Router();

router.post("/feedback", async (req, res): Promise<void> => {
  const { name, email, subject, message } = req.body;

  const filterErr = message ? assertClean(message, "Message") : null;
  if (filterErr) { res.status(400).json({ error: filterErr }); return; }
  if (subject && assertClean(subject, "Subject")) { res.status(400).json({ error: assertClean(subject, "Subject") }); return; }

  if (!message || typeof message !== "string" || message.trim().length < 5) {
    res.status(400).json({ error: "Message must be at least 5 characters." });
    return;
  }
  if (message.trim().length > 2000) {
    res.status(400).json({ error: "Message must be 2000 characters or fewer." });
    return;
  }
  if (subject && typeof subject === "string" && subject.length > 200) {
    res.status(400).json({ error: "Subject too long." });
    return;
  }
  if (name && typeof name === "string" && name.length > 100) {
    res.status(400).json({ error: "Name too long." });
    return;
  }
  if (email && typeof email === "string" && email.length > 200) {
    res.status(400).json({ error: "Email too long." });
    return;
  }

  try {
    await db.insert(feedbackTable).values({
      userId: req.isAuthenticated() ? req.user.id : null,
      name: name?.trim() || null,
      email: email?.trim() || null,
      subject: subject?.trim() || null,
      message: message.trim(),
    });

    res.json({ ok: true });
  } catch (err: any) {
    req.log.error({ err }, "Failed to save feedback");
    res.status(500).json({ error: "Failed to submit feedback." });
  }
});

export default router;
