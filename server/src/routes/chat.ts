import { Router } from "express";
import { classifyIntent } from "../services/intent";
import { extractMemories } from "../services/extraction";
import { storeExtraction } from "../services/memoryStore";
import {
  generatePlanningResponse,
  generateQuestionResponse,
  generateGeneralResponse,
  resolveOutcomeUpdate,
} from "../services/recommendation";
import { replayDecision } from "../services/decisionReplay";
import { addOutcome } from "../services/memoryStore";
import { WhyEvidence } from "../models/types";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body as { userId?: string; message?: string };
    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }

    const intent = await classifyIntent(message);

    if (intent === "new_memory" || intent === "memory_correction") {
      const extraction = await extractMemories(message);
      const created = await storeExtraction(userId, extraction);
      return res.json({
        intent,
        answer:
          created.length > 0
            ? `Got it. I've stored ${created.length} memor${created.length === 1 ? "y" : "ies"} from that.`
            : "Noted — nothing new worth remembering from that message.",
        stored: created,
        why: [] as WhyEvidence[],
        confidence: 1,
      });
    }

    if (intent === "planning_request") {
      const result = await generatePlanningResponse(userId, message);
      return res.json({ intent, ...result });
    }

    if (intent === "question") {
      const result = await generateQuestionResponse(userId, message);
      return res.json({ intent, ...result });
    }

    if (intent === "decision_support") {
      const replay = await replayDecision(userId, message);
      return res.json({
        intent,
        answer: replay.recommendation,
        decisionReplay: replay,
        why: replay.why,
        confidence: replay.confidence,
      });
    }

    if (intent === "outcome_update") {
      const resolution = await resolveOutcomeUpdate(userId, message);
      if (!resolution.decisionId) {
        return res.json({
          intent,
          answer: "I couldn't find a related decision to attach that outcome to.",
          why: [],
          confidence: 0.2,
        });
      }
      const outcome = await addOutcome(
        userId,
        resolution.decisionId,
        message,
        resolution.sentiment
      );
      return res.json({
        intent,
        answer: `Recorded that outcome and linked it to "${resolution.decisionContent}".`,
        outcome,
        why: [],
        confidence: 0.9,
      });
    }

    const answer = await generateGeneralResponse(message);
    return res.json({ intent, answer, why: [], confidence: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
