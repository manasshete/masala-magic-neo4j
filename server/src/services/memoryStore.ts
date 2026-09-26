import { v4 as uuid } from "uuid";
import { getSession, toPlainNode } from "./neo4j";
import { ExtractedMemory, ExtractionResult, MemoryLabel, MemoryNode } from "../models/types";
import { jaccardSimilarity } from "../utils/similarity";
import { computePageRank, normalizeScores } from "../utils/pagerank";

const USER_RELATIONSHIP: Partial<Record<MemoryLabel, string>> = {
  Preference: "HAS_PREFERENCE",
  Task: "HAS_TASK",
  Commitment: "HAS_COMMITMENT",
  Decision: "MADE_DECISION",
  Goal: "HAS_GOAL",
  Experience: "HAD_EXPERIENCE",
  Fact: "HAS_FACT",
};

const DUPLICATE_THRESHOLD = 0.6;

export async function ensureUser(userId: string): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `MERGE (u:User {id: $userId}) ON CREATE SET u.createdAt = datetime()`,
      { userId }
    );
  } finally {
    await session.close();
  }
}

export async function findSimilarMemory(
  userId: string,
  label: MemoryLabel,
  content: string
): Promise<MemoryNode | null> {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (n:${label} {userId: $userId}) RETURN n`,
      { userId }
    );
    let best: { node: MemoryNode; score: number } | null = null;
    for (const record of result.records) {
      const node = toPlainNode<MemoryNode>(record.get("n"));
      const score = jaccardSimilarity(content, node.content);
      if (score >= DUPLICATE_THRESHOLD && (!best || score > best.score)) {
        best = { node, score };
      }
    }
    return best ? best.node : null;
  } finally {
    await session.close();
  }
}

export async function createMemory(
  userId: string,
  memory: ExtractedMemory
): Promise<MemoryNode> {
  const existing = await findSimilarMemory(userId, memory.label, memory.content);
  const session = getSession();
  try {
    if (existing) {
      const result = await session.run(
        `MATCH (n:${memory.label} {id: $id})
         SET n.content = $content,
             n.type = $type,
             n.confidence = $confidence,
             n.importance = $importance,
             n.updatedAt = datetime()
         RETURN n`,
        {
          id: existing.id,
          content: memory.content,
          type: memory.type ?? null,
          confidence: memory.confidence,
          importance: memory.importance ?? 0.5,
        }
      );
      return toPlainNode<MemoryNode>(result.records[0].get("n"));
    }

    const id = uuid();
    const rel = USER_RELATIONSHIP[memory.label];
    const createUserLink = rel
      ? `WITH n MATCH (u:User {id: $userId}) MERGE (u)-[:${rel}]->(n)`
      : "";
    const result = await session.run(
      `CREATE (n:${memory.label} {
         id: $id,
         userId: $userId,
         content: $content,
         type: $type,
         confidence: $confidence,
         importance: $importance,
         source: $source,
         status: "active",
         createdAt: datetime(),
         updatedAt: datetime()
       })
       ${createUserLink}
       RETURN n`,
      {
        id,
        userId,
        content: memory.content,
        type: memory.type ?? null,
        confidence: memory.confidence,
        importance: memory.importance ?? 0.5,
        source: memory.source ?? "user_message",
      }
    );
    return toPlainNode<MemoryNode>(result.records[0].get("n"));
  } finally {
    await session.close();
  }
}

export async function storeExtraction(
  userId: string,
  extraction: ExtractionResult
): Promise<MemoryNode[]> {
  await ensureUser(userId);
  const created: MemoryNode[] = [];
  const byContent = new Map<string, MemoryNode>();

  for (const memory of extraction.memories) {
    const node = await createMemory(userId, memory);
    created.push(node);
    byContent.set(memory.content, node);
  }

  if (extraction.decisionLinks) {
    for (const link of extraction.decisionLinks) {
      const decision = byContent.get(link.decisionContent);
      if (!decision) continue;
      for (const reasonContent of link.reasonContents) {
        const reason = byContent.get(reasonContent);
        if (reason) await linkNodes(decision.id, reason.id, "BASED_ON");
      }
      if (link.taskContent) {
        const task = byContent.get(link.taskContent);
        if (task) await linkNodes(decision.id, task.id, "FOR_TASK");
      }
      if (link.goalContent) {
        const goal = byContent.get(link.goalContent);
        if (goal) await linkNodes(decision.id, goal.id, "RELATED_TO");
      }
    }
  }

  return created;
}

export async function linkNodes(
  fromId: string,
  toId: string,
  relType: string
): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `MATCH (a {id: $fromId}), (b {id: $toId})
       MERGE (a)-[:${relType}]->(b)`,
      { fromId, toId }
    );
  } finally {
    await session.close();
  }
}

export async function getAllMemories(userId: string): Promise<MemoryNode[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (n) WHERE n.userId = $userId
       RETURN DISTINCT n
       ORDER BY n.createdAt DESC`,
      { userId }
    );
    return result.records.map((r) => toPlainNode<MemoryNode>(r.get("n")));
  } finally {
    await session.close();
  }
}

export async function getMemoryById(id: string): Promise<{
  node: MemoryNode | null;
  related: { node: MemoryNode; relType: string; direction: "out" | "in" }[];
}> {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (n {id: $id})
       OPTIONAL MATCH (n)-[r1]->(out)
       OPTIONAL MATCH (in_)-[r2]->(n)
       RETURN n,
              collect(DISTINCT {node: out, relType: type(r1)}) AS outgoing,
              collect(DISTINCT {node: in_, relType: type(r2)}) AS incoming`,
      { id }
    );
    if (result.records.length === 0) return { node: null, related: [] };
    const record = result.records[0];
    const n = record.get("n");
    if (!n) return { node: null, related: [] };
    const outgoing = (record.get("outgoing") as any[])
      .filter((r) => r.node)
      .map((r) => ({
        node: toPlainNode<MemoryNode>(r.node),
        relType: r.relType as string,
        direction: "out" as const,
      }));
    const incoming = (record.get("incoming") as any[])
      .filter((r) => r.node)
      .map((r) => ({
        node: toPlainNode<MemoryNode>(r.node),
        relType: r.relType as string,
        direction: "in" as const,
      }));
    return { node: toPlainNode<MemoryNode>(n), related: [...outgoing, ...incoming] };
  } finally {
    await session.close();
  }
}

export async function addOutcome(
  userId: string,
  decisionId: string,
  content: string,
  sentiment: "positive" | "negative" | "neutral"
): Promise<MemoryNode> {
  const session = getSession();
  try {
    const id = uuid();
    const result = await session.run(
      `MATCH (d:Decision {id: $decisionId, userId: $userId})
       CREATE (o:Outcome {
         id: $id,
         userId: $userId,
         content: $content,
         type: $sentiment,
         confidence: 0.9,
         status: "active",
         createdAt: datetime(),
         updatedAt: datetime()
       })
       MERGE (d)-[:LED_TO]->(o)
       MERGE (o)-[:INFLUENCES]->(d)
       RETURN o`,
      { decisionId, userId, id, content, sentiment }
    );
    if (result.records.length === 0) {
      throw new Error("Decision not found");
    }
    return toPlainNode<MemoryNode>(result.records[0].get("o"));
  } finally {
    await session.close();
  }
}

/**
 * Ranks a user's memory nodes by graph influence (PageRank over the same
 * OWNS + relationship edges the graph view renders), so decisions/preferences
 * that many other memories point to or flow from surface as more important.
 */
export async function getInfluentialMemories(
  userId: string,
  limit = 5
): Promise<(MemoryNode & { label: string; influence: number })[]> {
  const { nodes } = await getGraph(userId);
  return (nodes as (MemoryNode & { label: string; influence: number })[])
    .filter((n) => (n.label as string) !== "User")
    .sort((a, b) => b.influence - a.influence)
    .slice(0, limit);
}

export async function getGraph(userId: string): Promise<{
  nodes: (MemoryNode & { label: string })[];
  links: { source: string; target: string; type: string }[];
}> {
  const session = getSession();
  try {
    const result = await session.run(
      `MATCH (u:User {id: $userId})
       OPTIONAL MATCH (u)-[:HAS_PREFERENCE|HAS_TASK|HAS_COMMITMENT|MADE_DECISION|HAS_GOAL|HAD_EXPERIENCE]->(n1)
       OPTIONAL MATCH (n1)-[r]->(n2)
       WITH u, collect(DISTINCT n1) AS level1, collect(DISTINCT {a: n1, r: r, b: n2}) AS edges
       RETURN u, level1, edges`,
      { userId }
    );
    const nodesMap = new Map<string, MemoryNode & { label: string }>();
    const links: { source: string; target: string; type: string }[] = [];

    const record = result.records[0];
    if (!record) return { nodes: [], links: [] };

    const userNode = record.get("u");
    const userPlain = toPlainNode<MemoryNode & { label: string }>(userNode);
    nodesMap.set(userPlain.id, userPlain);

    const level1 = record.get("level1") as any[];
    for (const n of level1) {
      if (!n) continue;
      const plain = toPlainNode<MemoryNode & { label: string }>(n);
      nodesMap.set(plain.id, plain);
      links.push({ source: userPlain.id, target: plain.id, type: "OWNS" });
    }

    const edges = record.get("edges") as any[];
    for (const e of edges) {
      if (!e.a || !e.r || !e.b) continue;
      const a = toPlainNode<MemoryNode & { label: string }>(e.a);
      const b = toPlainNode<MemoryNode & { label: string }>(e.b);
      nodesMap.set(a.id, a);
      nodesMap.set(b.id, b);
      links.push({
        source: a.id,
        target: b.id,
        type: e.r.type,
      });
    }

    const allNodes = Array.from(nodesMap.values());
    const scores = normalizeScores(computePageRank(allNodes.map((n) => n.id), links));
    for (const n of allNodes) n.influence = scores.get(n.id) ?? 0;

    return { nodes: allNodes, links };
  } finally {
    await session.close();
  }
}
