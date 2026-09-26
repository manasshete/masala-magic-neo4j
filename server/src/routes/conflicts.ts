import { Router } from "express";
import { detectConflicts } from "../services/conflict";

const router = Router();

router.post("/memory/conflicts", async (req, res) => {
  try {
    const { userId } = req.body as { userId?: string };
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const conflicts = await detectConflicts(userId);
    res.json({ conflicts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
