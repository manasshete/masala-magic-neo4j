import { askJSON, askText } from "./llm";
import { retrieveFullContext, GraphContext } from "./retrieval";
import { WhyEvidence } from "../models/types";
import { jaccardSimilarity } from "../utils/similarity";
import { getSession, toPlainNode } from "./neo4j";

export interface RecommendationResponse {
  answer: string;
  why: WhyEvidence[];
  confidence: number;
  insufficientEvidence: boolean;
}

function contextIsEmpty(ctx: GraphContext): boolean {
  return (
    ctx.preferences.length === 0 &&
    ctx.tasks.length === 0 &&
    ctx.decisions.length === 0 &&
    ctx.experiences.length === 0 &&
    ctx.goals.length === 0 &&
    ctx.facts.length === 0
  );
}

function buildWhyFromContext(ctx: GraphContext): WhyEvidence[] {
  const why: WhyEvidence[] = [];
  for (const f of ctx.facts) {
    why.push({
      memoryId: f.id,
      label: "Fact",
      content: f.content,
      explanation: "A personal fact relevant to this answer.",
    });
  }
  for (const p of ctx.preferences) {
    why.push({
      memoryId: p.id,
      label: "Preference",
      content: p.content,
      explanation: "A stated preference relevant to this recommendation.",
    });
  }
  for (const t of ctx.tasks) {
    why.push({
      memoryId: t.id,
      label: "Task",
      content: t.content,
      explanation: "A task or deadline relevant to this recommendation.",
    });
  }
  for (const d of ctx.decisions) {
    why.push({
      memoryId: d.id,
      label: "Decision",
      content: d.content,
      explanation: "A previous decision that informs this recommendation.",
    });
    for (const r of d.reasons) {
      why.push({
        memoryId: r.id,
        label: "Reason",
        content: r.content,
        explanation: "The reasoning behind a related past decision.",
      });
    }
    for (const o of d.outcomes) {
      why.push({
        memoryId: o.id,
        label: "Outcome",
        content: o.content,
        explanation: "What happened as a result of a related past decision.",
      });
    }
  }
  for (const e of ctx.experiences) {
    why.push({
      memoryId: e.id,
      label: "Experience",
      content: e.content,
      explanation: "A past experience relevant to this recommendation.",
    });
  }
  for (const g of ctx.goals) {
    why.push({
      memoryId: g.id,
      label: "Goal",
      content: g.content,
      explanation: "A goal this recommendation supports.",
    });
  }
  return why;
}

function dedupeWhy(why: WhyEvidence[]): WhyEvidence[] {
  const seen = new Set<string>();
  return why.filter((w) => {
    if (seen.has(w.memoryId)) return false;
    seen.add(w.memoryId);
    return true;
  });
}

async function generateFromContext(
  userId: string,
  message: string,
  instructions: string
): Promise<RecommendationResponse> {
  const ctx = await retrieveFullContext(userId);

  if (contextIsEmpty(ctx)) {
    return {
      answer: "I don't have enough history to confidently recommend this yet. Try loading demo memory or telling me about your preferences and tasks first.",
      why: [],
      confidence: 0.1,
      insufficientEvidence: true,
    };
  }

  const llmResult = await askJSON(
    `You are Memora, a personal decision-memory assistant. ${instructions}
Use ONLY the provided memory context; do not invent facts. If evidence is weak, say so honestly.
Respond ONLY with JSON: {"answer": "markdown string", "confidence": 0.0-1.0}`,
    JSON.stringify({ userMessage: message, context: ctx }),
    2500
  );

  return {
    answer: llmResult?.answer ?? "I couldn't generate a recommendation from the available memory.",
    why: dedupeWhy(buildWhyFromContext(ctx)),
    confidence: typeof llmResult?.confidence === "number" ? llmResult.confidence : 0.5,
    insufficientEvidence: false,
  };
}

export async function generatePlanningResponse(
  userId: string,
  message: string
): Promise<RecommendationResponse> {
  return generateFromContext(
    userId,
    message,
    `The user asked you to plan their time. Produce a concrete schedule (days/times) grounded in their tasks, deadlines, and morning/work-time preferences. Format the answer as markdown with a "### Personalized Plan" heading and a day-by-day list. Keep it concise: one short line per day/time-slot, no long grounding explanation paragraphs — the reasoning is shown separately in the UI.`
  );
}

export async function generateQuestionResponse(
  userId: string,
  message: string
): Promise<RecommendationResponse> {
  return generateFromContext(
    userId,
    message,
    `The user is asking a question, possibly a "why" question about a previous recommendation or about their own history. Answer directly and cite the specific memories (preferences, tasks, decisions, reasons, experiences) that justify the answer.`
  );
}

export async function generateGeneralResponse(message: string): Promise<string> {
  return askText(
    "You are Memora, a friendly personal decision-memory assistant. Keep replies brief.",
    message,
    300
  );
}

export interface OutcomeResolution {
  decisionId: string | null;
  decisionContent: string | null;
  sentiment: "positive" | "negative" | "neutral";
}

export async function resolveOutcomeUpdate(
  userId: string,
  message: string
): Promise<OutcomeResolution> {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User {id: $userId})-[:MADE_DECISION]->(d:Decision)
       WHERE NOT (d)-[:LED_TO]->(:Outcome)
       RETURN d ORDER BY d.createdAt DESC`,
      { userId }
    );
    const candidates = result.records.map((r) => toPlainNode<{ id: string; content: string }>(r.get("d")));

    let best: { id: string; content: string; score: number } | null = null;
    for (const c of candidates) {
      const score = jaccardSimilarity(message, c.content);
      if (!best || score > best.score) best = { id: c.id, content: c.content, score };
    }

    const sentimentResult = await askJSON(
      `Classify the sentiment of this outcome report as positive, negative, or neutral.
Respond ONLY with JSON: {"sentiment": "positive"|"negative"|"neutral"}`,
      message,
      50
    ).catch(() => ({ sentiment: "neutral" }));

    const fallback = candidates[0];
    return {
      decisionId: best?.id ?? fallback?.id ?? null,
      decisionContent: best?.content ?? fallback?.content ?? null,
      sentiment: sentimentResult?.sentiment ?? "neutral",
    };
  } finally {
    await session.close();
  }
}
