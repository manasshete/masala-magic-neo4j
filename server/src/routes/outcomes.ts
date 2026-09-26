import { Router } from "express";
import { addOutcome } from "../services/memoryStore";

const router = Router();

router.post("/outcomes", async (req, res) => {
  try {
    const { userId, decisionId, content, sentiment } = req.body as {
      userId?: string;
      decisionId?: string;
      content?: string;
      sentiment?: "positive" | "negative" | "neutral";
    };
    if (!userId || !decisionId || !content) {
      return res.status(400).json({ error: "userId, decisionId and content are required" });
    }
    const outcome = await addOutcome(userId, decisionId, content, sentiment ?? "neutral");
    res.json({ outcome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
