import { Router } from "express";
import { replayDecision } from "../services/decisionReplay";

const router = Router();

router.post("/decisions/replay", async (req, res) => {
  try {
    const { userId, question } = req.body as { userId?: string; question?: string };
    if (!userId || !question) {
      return res.status(400).json({ error: "userId and question are required" });
    }
    const result = await replayDecision(userId, question);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
