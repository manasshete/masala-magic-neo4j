export type MemoryLabel =
  | "Preference"
  | "Task"
  | "Commitment"
  | "Decision"
  | "Reason"
  | "Outcome"
  | "Goal"
  | "Experience"
  | "Fact";

export interface MemoryNode {
  id: string;
  userId: string;
  label?: MemoryLabel;
  content: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
  confidence: number;
  importance?: number;
  status?: string;
  source?: string;
  influence?: number;
  [key: string]: unknown;
}

export interface WhyEvidence {
  memoryId: string;
  label: MemoryLabel;
  content: string;
  explanation: string;
}

export type Intent =
  | "new_memory"
  | "question"
  | "planning_request"
  | "decision_support"
  | "outcome_update"
  | "memory_correction"
  | "general_conversation";

export interface DecisionReplayResult {
  currentQuestion: string;
  matchedDecision: MemoryNode | null;
  matchedReasons: MemoryNode[];
  matchedOutcomes: MemoryNode[];
  recommendation: string;
  confidence: number;
  why: WhyEvidence[];
}

export interface ChatResponse {
  intent: Intent;
  answer: string;
  why: WhyEvidence[];
  confidence: number;
  stored?: MemoryNode[];
  decisionReplay?: DecisionReplayResult;
  outcome?: MemoryNode;
  insufficientEvidence?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse;
}

export interface GraphData {
  nodes: (MemoryNode & { label: string })[];
  links: { source: string; target: string; type: string }[];
}
