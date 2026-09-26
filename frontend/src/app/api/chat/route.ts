import { NextRequest, NextResponse } from "next/server";
import { classifyIntent } from "@/server/services/intent";
import { extractMemories } from "@/server/services/extraction";
import { storeExtraction, addOutcome } from "@/server/services/memoryStore";
import {
  generatePlanningResponse,
  generateQuestionResponse,
  generateGeneralResponse,
  resolveOutcomeUpdate,
} from "@/server/services/recommendation";
import { replayDecision } from "@/server/services/decisionReplay";
import { WhyEvidence } from "@/server/models/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = (await req.json()) as { userId?: string; message?: string };
    if (!userId || !message) {
      return NextResponse.json({ error: "userId and message are required" }, { status: 400 });
    }

    const intent = await classifyIntent(message);

    if (intent === "new_memory" || intent === "memory_correction") {
      const extraction = await extractMemories(message);
      const created = await storeExtraction(userId, extraction);
      return NextResponse.json({
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
      return NextResponse.json({ intent, ...result });
    }

    if (intent === "question") {
      const result = await generateQuestionResponse(userId, message);
      return NextResponse.json({ intent, ...result });
    }

    if (intent === "decision_support") {
      const replay = await replayDecision(userId, message);
      return NextResponse.json({
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
        return NextResponse.json({
          intent,
          answer: "I couldn't find a related decision to attach that outcome to.",
          why: [],
          confidence: 0.2,
        });
      }
      const outcome = await addOutcome(userId, resolution.decisionId, message, resolution.sentiment);
      return NextResponse.json({
        intent,
        answer: `Recorded that outcome and linked it to "${resolution.decisionContent}".`,
        outcome,
        why: [],
        confidence: 0.9,
      });
    }

    const answer = await generateGeneralResponse(message);
    return NextResponse.json({ intent, answer, why: [], confidence: 1 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
