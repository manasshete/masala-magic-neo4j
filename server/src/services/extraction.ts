import { askJSON } from "./llm";
import { ExtractionResult } from "../models/types";

const SYSTEM = `You extract structured personal-memory facts from a user's message for a decision-memory assistant called Memora.

Valid memory labels: Preference, Task, Commitment, Decision, Reason, Goal, Experience, Fact.
(Outcome memories are only created via a separate outcome-update flow, not here.)

Use Fact for stable personal/identity information that doesn't fit the other labels — e.g. the user's name, role, employer, location, or other biographical details ("My name is Manas", "I work as a backend developer", "I'm based in Pune").

Rules:
- Only extract memories that are meaningful and reusable for future decisions. Do not store filler or every sentence.
- confidence: 0.85-1.0 if the user stated it explicitly and generally ("I always...", "I usually...", "I prefer..."), 0.5-0.7 if it is a one-off or inferred statement.
- importance: 0-1, how much this should weigh in future recommendations.
- If the message describes a Decision, also include its Reason(s) as separate Reason memories, and fill "decisionLinks" connecting the decision content to its reason contents (and task/goal content if mentioned).
- Reason content should be short phrases describing WHY, e.g. "Important presentations usually require two days of preparation".
- Task content should include the task name and any deadline mentioned, e.g. "Client presentation due Wednesday".

Respond ONLY with JSON matching this shape:
{
  "memories": [
    { "label": "Preference"|"Task"|"Commitment"|"Decision"|"Reason"|"Goal"|"Experience"|"Fact",
      "content": "string", "type": "string optional", "confidence": 0.0-1.0, "importance": 0.0-1.0 }
  ],
  "decisionLinks": [
    { "decisionContent": "string matching a memory content above",
      "reasonContents": ["string matching reason memory content above"],
      "taskContent": "string optional, matching a task memory content above",
      "goalContent": "string optional" }
  ]
}
If there is nothing worth storing, return {"memories": [], "decisionLinks": []}.`;

export async function extractMemories(message: string): Promise<ExtractionResult> {
  const result = await askJSON(SYSTEM, message, 1500);
  return {
    memories: Array.isArray(result?.memories) ? result.memories : [],
    decisionLinks: Array.isArray(result?.decisionLinks) ? result.decisionLinks : [],
  };
}
