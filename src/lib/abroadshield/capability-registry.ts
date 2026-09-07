export type CapabilityClass = "trusted_internal" | "verified_external" | "experimental_ai";
export type CapabilityProtocol = "internal" | "http" | "mcp" | "connector";
export type CapabilityStatus = "active" | "available_when_configured" | "disabled";

export type CapabilityDefinition = {
  id: string;
  label: string;
  description: string;
  category: "policy" | "workflow" | "communication" | "research" | "document" | "matching";
  provider: string;
  protocol: CapabilityProtocol;
  class: CapabilityClass;
  status: CapabilityStatus;
  deterministic: boolean;
  evidenceProducing: boolean;
  requiresLiveData: boolean;
  requiresApproval: boolean;
  mutatesDomain: boolean;
  allowedPhases: readonly string[];
  countries?: readonly string[];
};

const ALL_PHASES = ["pre-departure", "arrival", "studying", "job-success"] as const;

/** Provider-neutral capability catalogue. Experimental AI never mutates authoritative domain state. */
export const CAPABILITY_REGISTRY = {
  france_policy_engine: { id: "france_policy_engine", label: "France policy engine", description: "Deterministic versioned France policy execution.", category: "policy", provider: "abroadshield", protocol: "internal", class: "trusted_internal", status: "active", deterministic: true, evidenceProducing: true, requiresLiveData: false, requiresApproval: false, mutatesDomain: false, allowedPhases: ALL_PHASES, countries: ["FR"] },
  journey_orchestrator: { id: "journey_orchestrator", label: "Journey orchestrator", description: "Deterministic stage and capability routing.", category: "workflow", provider: "abroadshield", protocol: "internal", class: "trusted_internal", status: "active", deterministic: true, evidenceProducing: false, requiresLiveData: false, requiresApproval: false, mutatesDomain: true, allowedPhases: ALL_PHASES },
  approval_execution: { id: "approval_execution", label: "Approval execution", description: "Approval-gated consequential connector execution and audit.", category: "communication", provider: "abroadshield", protocol: "connector", class: "verified_external", status: "active", deterministic: true, evidenceProducing: true, requiresLiveData: false, requiresApproval: true, mutatesDomain: true, allowedPhases: ALL_PHASES },
  live_web_search: { id: "live_web_search", label: "Live web search", description: "Current retrieval through the configured search provider.", category: "research", provider: "tavily", protocol: "http", class: "verified_external", status: "available_when_configured", deterministic: false, evidenceProducing: true, requiresLiveData: true, requiresApproval: false, mutatesDomain: false, allowedPhases: ALL_PHASES },
  mcp_hub_search: { id: "mcp_hub_search", label: "MCP hub search", description: "Optional Hugging Face MCP discovery for models, datasets, Spaces, papers and docs.", category: "research", provider: "huggingface", protocol: "mcp", class: "experimental_ai", status: "available_when_configured", deterministic: false, evidenceProducing: true, requiresLiveData: true, requiresApproval: false, mutatesDomain: false, allowedPhases: ALL_PHASES },
  mcp_document_ai: { id: "mcp_document_ai", label: "MCP document AI", description: "Optional OCR/document extraction; output must be validated before entering evidence state.", category: "document", provider: "mcp-provider", protocol: "mcp", class: "experimental_ai", status: "available_when_configured", deterministic: false, evidenceProducing: true, requiresLiveData: false, requiresApproval: false, mutatesDomain: false, allowedPhases: ALL_PHASES },
  mcp_cv_matching: { id: "mcp_cv_matching", label: "MCP CV/job matching", description: "Optional CV skill extraction and supplied-role matching.", category: "matching", provider: "mcp-provider", protocol: "mcp", class: "experimental_ai", status: "available_when_configured", deterministic: false, evidenceProducing: false, requiresLiveData: false, requiresApproval: false, mutatesDomain: false, allowedPhases: ["studying", "job-success"] },
  mcp_translation: { id: "mcp_translation", label: "MCP translation", description: "Optional translation of user-provided text; never a legal source.", category: "document", provider: "mcp-provider", protocol: "mcp", class: "experimental_ai", status: "available_when_configured", deterministic: false, evidenceProducing: false, requiresLiveData: false, requiresApproval: false, mutatesDomain: false, allowedPhases: ALL_PHASES },
} satisfies Record<string, CapabilityDefinition>;

export type CapabilityId = keyof typeof CAPABILITY_REGISTRY;

export function getCapability(id: string): CapabilityDefinition | undefined {
  return CAPABILITY_REGISTRY[id as CapabilityId];
}

export function listCapabilities(): CapabilityDefinition[] {
  return Object.values(CAPABILITY_REGISTRY);
}

export function isCapabilityUsable(id: string, phase?: string): boolean {
  const capability = getCapability(id);
  return !!capability && capability.status !== "disabled" && (!phase || capability.allowedPhases.includes(phase));
}

export function isExperimentalCapability(id: string): boolean {
  return getCapability(id)?.class === "experimental_ai";
}

export function canCapabilityMutateDomain(id: string): boolean {
  return getCapability(id)?.mutatesDomain === true;
}
