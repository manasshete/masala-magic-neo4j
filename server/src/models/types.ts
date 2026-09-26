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
  label: MemoryLabel;
  content: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
  confidence: number;
  importance?: number;
  status?: string;
  source?: string;
  influence?: number;
  // free-form extras (e.g. deadline, outcomeSentiment)
  [key: string]: unknown;
}

export interface WhyEvidence {
  memoryId: string;
  label: MemoryLabel;
  content: string;
  explanation: string;
}

export interface ExtractedMemory {
  label: MemoryLabel;
  content: string;
  type?: string;
  confidence: number;
  importance?: number;
  source?: string;
  relatesTo?: string; // free text hint used for linking, e.g. "client presentation"
}

export interface ExtractionResult {
  memories: ExtractedMemory[];
  decisionLinks?: {
    decisionContent: string;
    reasonContents: string[];
    taskContent?: string;
    goalContent?: string;
  }[];
}

export type Intent =
  | "new_memory"
  | "question"
  | "planning_request"
  | "decision_support"
  | "outcome_update"
  | "memory_correction"
  | "general_conversation";
