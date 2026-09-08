import type { AgentCapability } from "./tool-registry";
import type { StudentContextSnapshot } from "./student-context";

export type AgentIntent =
  | "research"
  | "plan"
  | "prepare"
  | "execute"
  | "track";

export type AgentExecutionStatus =
  | "planned"
  | "ready"
  | "approval_required"
  | "executed"
  | "partially_executed"
  | "blocked"
  | "failed";

export type AgentExecutionRequest = {
  requestId: string;
  userId: string;
  message: string;
  intent: AgentIntent;
  capabilities: AgentCapability[];
  context: StudentContextSnapshot;
  requestedAt: string;
};

export type AgentExecutionStep = {
  id: string;
  capability: AgentCapability;
  purpose: string;
  status: AgentExecutionStatus;
  requiresApproval: boolean;
  mutatesDomain: boolean;
  externalAction: boolean;
};

export type AgentExecutionResult = {
  requestId: string;
  status: AgentExecutionStatus;
  steps: AgentExecutionStep[];
  evidenceIds: string[];
  actionIds: string[];
  userMessage: string;
  completedAt: string;
};
