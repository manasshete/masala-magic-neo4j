import { askJSON } from "./llm";
import { Intent } from "../models/types";

const INTENTS: Intent[] = [
  "new_memory",
  "question",
  "planning_request",
  "decision_support",
  "outcome_update",
  "memory_correction",
  "general_conversation",
];

const SYSTEM = `You classify a user's message into exactly one intent for a personal memory assistant.
Intents:
- new_memory: user is stating a preference, task, deadline, commitment, goal, past experience, or personal/identity fact (e.g. their name, role, location) worth remembering.
- question: user asks "why" something was recommended, or asks about their stored memories/history.
- planning_request: user asks to plan/schedule time (e.g. "plan my week").
- decision_support: user asks for help deciding between options, or asks "should I ...".
- outcome_update: user reports what happened / result of something they did or decided.
- memory_correction: user corrects or updates a previously stated preference/fact.
- general_conversation: anything else (greetings, small talk).

Respond ONLY with JSON: {"intent": "<one of the intents>"}`;

export async function classifyIntent(message: string): Promise<Intent> {
  try {
    const result = await askJSON(SYSTEM, message, 100);
    if (result && INTENTS.includes(result.intent)) {
      return result.intent as Intent;
    }
  } catch {
    // fall through to heuristic fallback
  }
  const lower = message.toLowerCase();
  if (lower.startsWith("why")) return "question";
  if (lower.includes("plan my")) return "planning_request";
  if (lower.includes("should i")) return "decision_support";
  return "new_memory";
}
