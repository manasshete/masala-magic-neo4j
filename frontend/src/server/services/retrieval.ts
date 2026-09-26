import { getSession, toPlainNode } from "./neo4j";
import { MemoryNode } from "../models/types";

export interface GraphContext {
  preferences: MemoryNode[];
  tasks: MemoryNode[];
  decisions: (MemoryNode & { reasons: MemoryNode[]; outcomes: MemoryNode[] })[];
  experiences: MemoryNode[];
  outcomes: MemoryNode[];
  goals: MemoryNode[];
  facts: MemoryNode[];
}

export async function retrieveFullContext(userId: string): Promise<GraphContext> {
  const session = getSession();
  try {
    const preferences = await session.run(
      `MATCH (u:User {id: $userId})-[:HAS_PREFERENCE]->(p:Preference) RETURN p ORDER BY p.importance DESC`,
      { userId }
    );
    const tasks = await session.run(
      `MATCH (u:User {id: $userId})-[:HAS_TASK]->(t:Task) RETURN t ORDER BY t.createdAt DESC`,
      { userId }
    );
    const goals = await session.run(
      `MATCH (u:User {id: $userId})-[:HAS_GOAL]->(g:Goal) RETURN g ORDER BY g.importance DESC`,
      { userId }
    );
    const experiences = await session.run(
      `MATCH (u:User {id: $userId})-[:HAD_EXPERIENCE]->(e:Experience) RETURN e ORDER BY e.createdAt DESC`,
      { userId }
    );
    const decisions = await session.run(
      `MATCH (u:User {id: $userId})-[:MADE_DECISION]->(d:Decision)
       OPTIONAL MATCH (d)-[:BASED_ON]->(r:Reason)
       OPTIONAL MATCH (d)-[:LED_TO]->(o:Outcome)
       RETURN d, collect(DISTINCT r) AS reasons, collect(DISTINCT o) AS outcomes
       ORDER BY d.createdAt DESC`,
      { userId }
    );
    const outcomes = await session.run(
      `MATCH (u:User {id: $userId})-[:MADE_DECISION]->(:Decision)-[:LED_TO]->(o:Outcome)
       RETURN DISTINCT o ORDER BY o.createdAt DESC`,
      { userId }
    );
    const facts = await session.run(
      `MATCH (u:User {id: $userId})-[:HAS_FACT]->(f:Fact) RETURN f ORDER BY f.createdAt DESC`,
      { userId }
    );

    return {
      preferences: preferences.records.map((r) => toPlainNode<MemoryNode>(r.get("p"))),
      tasks: tasks.records.map((r) => toPlainNode<MemoryNode>(r.get("t"))),
      goals: goals.records.map((r) => toPlainNode<MemoryNode>(r.get("g"))),
      experiences: experiences.records.map((r) => toPlainNode<MemoryNode>(r.get("e"))),
      outcomes: outcomes.records.map((r) => toPlainNode<MemoryNode>(r.get("o"))),
      facts: facts.records.map((r) => toPlainNode<MemoryNode>(r.get("f"))),
      decisions: decisions.records.map((r) => ({
        ...toPlainNode<MemoryNode>(r.get("d")),
        reasons: (r.get("reasons") as any[]).filter(Boolean).map((n) => toPlainNode<MemoryNode>(n)),
        outcomes: (r.get("outcomes") as any[]).filter(Boolean).map((n) => toPlainNode<MemoryNode>(n)),
      })),
    };
  } finally {
    await session.close();
  }
}
