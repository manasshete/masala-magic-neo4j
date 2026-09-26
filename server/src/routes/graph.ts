import { Router } from "express";
import { getGraph, getInfluentialMemories } from "../services/memoryStore";

const router = Router();

router.get("/graph", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "userId query param is required" });
    const graph = await getGraph(userId);
    res.json(graph);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/graph/influence", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "userId query param is required" });
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const nodes = await getInfluentialMemories(userId, limit);
    res.json({ nodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
