import {
  ChatResponse,
  DecisionReplayResult,
  GraphData,
  MemoryNode,
} from "./types";

export const DEMO_USER_ID = "demo-user";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function sendChatMessage(userId: string, message: string) {
  return request<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ userId, message }),
  });
}

export function loadDemoData(userId: string = DEMO_USER_ID) {
  return request<{ ok: boolean; userId: string }>("/api/demo/load", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function getMemories(userId: string) {
  return request<{ memories: MemoryNode[] }>(
    `/api/memories?userId=${encodeURIComponent(userId)}`
  );
}

export function getMemoryDetail(id: string) {
  return request<{ memory: MemoryNode; related: { node: MemoryNode; relType: string; direction: string }[] }>(
    `/api/memories/${id}`
  );
}

export function getGraph(userId: string) {
  return request<GraphData>(`/api/graph?userId=${encodeURIComponent(userId)}`);
}

export function replayDecision(userId: string, question: string) {
  return request<DecisionReplayResult>("/api/decisions/replay", {
    method: "POST",
    body: JSON.stringify({ userId, question }),
  });
}

export function addOutcome(
  userId: string,
  decisionId: string,
  content: string,
  sentiment: "positive" | "negative" | "neutral"
) {
  return request<{ outcome: MemoryNode }>("/api/outcomes", {
    method: "POST",
    body: JSON.stringify({ userId, decisionId, content, sentiment }),
  });
}

export function getInfluentialMemories(userId: string, limit = 5) {
  return request<{ nodes: (MemoryNode & { label: string; influence: number })[] }>(
    `/api/graph/influence?userId=${encodeURIComponent(userId)}&limit=${limit}`
  );
}

export function getConflicts(userId: string) {
  return request<{ conflicts: { previous: MemoryNode; recent: MemoryNode; question: string }[] }>(
    "/api/memory/conflicts",
    { method: "POST", body: JSON.stringify({ userId }) }
  );
}
