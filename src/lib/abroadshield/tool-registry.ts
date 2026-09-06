export const AGENT_CAPABILITIES = [
  "document_check",
  "draft_email",
  "job_search",
  "tailor_cv",
  "deadline_scan",
  "housing_search",
  "visa_check",
  "work_rule_check",
  "cvec_payment",
  "vlsts_validation",
  "caf_housing_check",
  "ameli_registration",
] as const;

export type AgentCapability = (typeof AGENT_CAPABILITIES)[number];

export type ToolDefinition = {
  capability: AgentCapability;
  label: string;
  execution: "task-engine" | "live-search" | "connector";
  requiresLiveData: boolean;
  requiresApproval: boolean;
  connector?: "google";
};

/** Canonical capability contract shared by agent actions and workspace actions. */
export const TOOL_REGISTRY: Record<AgentCapability, ToolDefinition> = {
  document_check: { capability: "document_check", label: "Check documents", execution: "task-engine", requiresLiveData: false, requiresApproval: false },
  draft_email: { capability: "draft_email", label: "Draft an email", execution: "task-engine", requiresLiveData: false, requiresApproval: true, connector: "google" },
  job_search: { capability: "job_search", label: "Find jobs", execution: "live-search", requiresLiveData: true, requiresApproval: false },
  tailor_cv: { capability: "tailor_cv", label: "Tailor CV", execution: "task-engine", requiresLiveData: false, requiresApproval: false },
  deadline_scan: { capability: "deadline_scan", label: "Scan deadlines", execution: "task-engine", requiresLiveData: false, requiresApproval: false },
  housing_search: { capability: "housing_search", label: "Find housing", execution: "live-search", requiresLiveData: true, requiresApproval: false },
  visa_check: { capability: "visa_check", label: "Check visa guidance", execution: "live-search", requiresLiveData: true, requiresApproval: false },
  work_rule_check: { capability: "work_rule_check", label: "Check work-rule budget", execution: "task-engine", requiresLiveData: false, requiresApproval: false },
  cvec_payment: { capability: "cvec_payment", label: "Prepare CVEC payment", execution: "task-engine", requiresLiveData: false, requiresApproval: true },
  vlsts_validation: { capability: "vlsts_validation", label: "Check VLS-TS validation", execution: "task-engine", requiresLiveData: false, requiresApproval: false },
  caf_housing_check: { capability: "caf_housing_check", label: "Check CAF housing workflow", execution: "task-engine", requiresLiveData: true, requiresApproval: false },
  ameli_registration: { capability: "ameli_registration", label: "Prepare health registration", execution: "task-engine", requiresLiveData: false, requiresApproval: false },
};

export function getTool(capability: string): ToolDefinition | undefined {
  return TOOL_REGISTRY[capability as AgentCapability];
}
