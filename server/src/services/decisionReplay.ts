import { getSession, toPlainNode } from "./neo4j";
import { askJSON } from "./llm";
import { MemoryNode, WhyEvidence } from "../models/types";
import { jaccardSimilarity } from "../utils/similarity";

interface PastDecision {
  decision: MemoryNode;
  reasons: MemoryNode[];
  outcomes: MemoryNode[];
  task: MemoryNode | null;
}

export interface DecisionReplayResult {
  currentQuestion: string;
  matchedDecision: MemoryNode | null;
  matchedReasons: MemoryNode[];
  matchedOutcomes: MemoryNode[];
  recommendation: string;
  confidence: number;
  why: WhyEvidence[];
}

async function getPastDecisions(userId: string): Promise<PastDecision[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User {id: $userId})-[:MADE_DECISION]->(d:Decision)
       OPTIONAL MATCH (d)-[:BASED_ON]->(r:Reason)
       OPTIONAL MATCH (d)-[:LED_TO]->(o:Outcome)
       OPTIONAL MATCH (d)-[:FOR_TASK]->(t:Task)
       RETURN d, collect(DISTINCT r) AS reasons, collect(DISTINCT o) AS outcomes, head(collect(DISTINCT t)) AS task`,
      { userId }
    );
    return result.records.map((rec) => ({
      decision: toPlainNode<MemoryNode>(rec.get("d")),
      reasons: (rec.get("reasons") as any[]).filter(Boolean).map((n) => toPlainNode<MemoryNode>(n)),
      outcomes: (rec.get("outcomes") as any[]).filter(Boolean).map((n) => toPlainNode<MemoryNode>(n)),
      task: rec.get("task") ? toPlainNode<MemoryNode>(rec.get("task")) : null,
    }));
  } finally {
    await session.close();
  }
}

function scoreDecision(question: string, pd: PastDecision): number {
  const text = [pd.decision.content, ...pd.reasons.map((r) => r.content), pd.task?.content ?? ""]
    .join(" ");
  return jaccardSimilarity(question, text);
}

export async function replayDecision(
  userId: string,
  question: string
): Promise<DecisionReplayResult> {
  const pastDecisions = await getPastDecisions(userId);

  let best: { pd: PastDecision; score: number } | null = null;
  for (const pd of pastDecisions) {
    const score = scoreDecision(question, pd);
    if (!best || score > best.score) best = { pd, score };
  }

  if (!best || best.score < 0.05 || pastDecisions.length === 0) {
    return {
      currentQuestion: question,
      matchedDecision: null,
      matchedReasons: [],
      matchedOutcomes: [],
      recommendation:
        "I don't have enough history to confidently recommend this. This will be an inference based on limited history.",
      confidence: 0.2,
      why: [],
    };
  }

  const { pd } = best;
  const context = {
    currentQuestion: question,
    previousDecision: pd.decision.content,
    reasons: pd.reasons.map((r) => r.content),
    outcomes: pd.outcomes.map((o) => ({ content: o.content, sentiment: o.type })),
    task: pd.task?.content ?? null,
  };

  const llmResult = await askJSON(
    `You are Memora's Decision Replay engine. Given a current decision question and the most similar
past decision (with its reasons and outcomes), produce a recommendation.
If past outcomes are positive, lean toward recommending similarly. If negative, caution against repeating it.
If there are no outcomes yet, say the recommendation is based on reasoning alone, not proven results, and lower confidence.
Respond ONLY with JSON: {"recommendation": "string, 1-3 sentences", "confidence": 0.0-1.0}`,
    JSON.stringify(context),
    500
  );

  const why: WhyEvidence[] = [
    {
      memoryId: pd.decision.id,
      label: "Decision",
      content: pd.decision.content,
      explanation: "This is the most similar past decision you made.",
    },
    ...pd.reasons.map((r) => ({
      memoryId: r.id,
      label: "Reason" as const,
      content: r.content,
      explanation: "This was your reasoning behind that past decision.",
    })),
    ...pd.outcomes.map((o) => ({
      memoryId: o.id,
      label: "Outcome" as const,
      content: o.content,
      explanation: "This is what happened last time, which informs this recommendation.",
    })),
  ];

  return {
    currentQuestion: question,
    matchedDecision: pd.decision,
    matchedReasons: pd.reasons,
    matchedOutcomes: pd.outcomes,
    recommendation:
      llmResult?.recommendation ??
      "This is an inference based on limited history.",
    confidence: typeof llmResult?.confidence === "number" ? llmResult.confidence : 0.5,
    why,
  };
}
