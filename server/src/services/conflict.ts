import { getSession, toPlainNode } from "./neo4j";
import { askJSON } from "./llm";
import { MemoryNode } from "../models/types";

export interface MemoryConflict {
  previous: MemoryNode;
  recent: MemoryNode;
  question: string;
}

export async function detectConflicts(userId: string): Promise<MemoryConflict[]> {
  const session = getSession();
  let preferences: MemoryNode[];
  try {
    const result = await session.run(
      `MATCH (u:User {id: $userId})-[:HAS_PREFERENCE]->(p:Preference)
       RETURN p ORDER BY p.createdAt ASC`,
      { userId }
    );
    preferences = result.records.map((r) => toPlainNode<MemoryNode>(r.get("p")));
  } finally {
    await session.close();
  }

  const byType = new Map<string, MemoryNode[]>();
  for (const p of preferences) {
    const key = p.type ?? "general";
    if (!byType.has(key)) byType.set(key, []);
    byType.get(key)!.push(p);
  }

  const conflicts: MemoryConflict[] = [];
  for (const group of byType.values()) {
    if (group.length < 2) continue;
    const older = group[0];
    const newest = group[group.length - 1];
    if (older.id === newest.id) continue;

    const result = await askJSON(
      `You detect whether two statements from the same user about the same topic contradict each other.
Respond ONLY with JSON: {"conflict": true|false}`,
      `Older statement: "${older.content}"\nRecent statement: "${newest.content}"`,
      100
    ).catch(() => ({ conflict: false }));

    if (result?.conflict) {
      conflicts.push({
        previous: older,
        recent: newest,
        question:
          "Your recent behavior seems different from your previous preference. Should I update your preference?",
      });
    }
  }

  return conflicts;
}
