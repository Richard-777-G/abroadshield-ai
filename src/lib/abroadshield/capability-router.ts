import { getCapability, type CapabilityDefinition, type CapabilityId } from "./capability-registry";
import { getTool, type AgentCapability } from "./tool-registry";

const RULES: Array<[AgentCapability, RegExp[]]> = [
  ["cvec_payment", [/\b(cvec|contribution vie étudiante|campus contribution)\b/i]],
  ["vlsts_validation", [/\b(vls[- ]?ts|validate.*(vls|visa)|visa.*validation)\b/i]],
  ["work_rule_check", [/\b(work hours|working hours|student work limit|964 hours|part[- ]?time work limit|work[- ]?hour budget)\b/i]],
  ["document_check", [/\b(document|documents|passport|bank statement|cas|certificate|upload|file)\b/i]],
  ["draft_email", [/\b(draft|write|compose)\b.*\b(email|mail|message)\b/i, /\b(email|mail)\b.*\b(draft|write|compose|send)\b/i]],
  ["job_search", [
    /\b(find|search|look for|shortlist|show me)\b.*\b(job|jobs|role|roles|employment|vacanc|internship|internships|intern|stage|stages|apprenticeship|apprenticeships|alternance|part[- ]?time|full[- ]?time)\b/i,
    /\b(job|jobs|role|roles|internship|internships|stage|stages|apprenticeship|apprenticeships|alternance)\b.*\b(find|search|shortlist|in|around|near)\b/i,
  ]],
  ["tailor_cv", [/\b(tailor|adapt|customize|customise|rewrite)\b.*\b(cv|resume)\b/i]],
  ["deadline_scan", [/\b(deadline|deadlines|due date|due dates|what.*next|upcoming)\b/i]],
  ["housing_search", [/\b(find|search|look for|shortlist)\b.*\b(housing|house|room|rooms|flat|flats|accommodation|rent|rental)\b/i]],
  ["visa_check", [/\b(visa|immigration|residence permit|graduate route|student visa)\b/i]],
];

export type CapabilityRoute = {
  agentCapability: AgentCapability;
  capabilityId: CapabilityId;
  definition: CapabilityDefinition;
};

const AGENT_TO_CAPABILITY: Record<AgentCapability, CapabilityId> = {
  document_check: "mcp_document_ai",
  draft_email: "approval_execution",
  job_search: "live_web_search",
  tailor_cv: "mcp_cv_matching",
  deadline_scan: "journey_orchestrator",
  housing_search: "live_web_search",
  visa_check: "live_web_search",
  work_rule_check: "france_policy_engine",
  cvec_payment: "france_policy_engine",
  vlsts_validation: "france_policy_engine",
  caf_housing_check: "live_web_search",
  ameli_registration: "journey_orchestrator",
};

export function detectCapability(message: string): AgentCapability | null {
  const text = message.trim();
  if (!text) return null;
  for (const [capability, patterns] of RULES) {
    if (patterns.some((pattern) => pattern.test(text)) && getTool(capability)) return capability;
  }
  return null;
}

export function routeAgentCapability(agentCapability: AgentCapability): CapabilityRoute {
  const capabilityId = AGENT_TO_CAPABILITY[agentCapability];
  const definition = getCapability(capabilityId);
  if (!definition) throw new Error(`Capability ${capabilityId} is not registered.`);
  return { agentCapability, capabilityId, definition };
}

export function assertCapabilityExecutionAllowed(
  agentCapability: AgentCapability,
  options: { phase: string; country?: string },
): CapabilityRoute {
  const route = routeAgentCapability(agentCapability);
  const { definition } = route;
  if (definition.status === "disabled") throw new Error(`Capability ${definition.label} is disabled.`);
  if (!definition.allowedPhases.includes(options.phase)) {
    throw new Error(`${definition.label} is not available in the ${options.phase} phase.`);
  }
  if (definition.countries?.length && options.country) {
    const country = options.country.trim().toUpperCase();
    if (!definition.countries.includes(country)) throw new Error(`${definition.label} is not available for ${country}.`);
  }
  if (definition.class === "experimental_ai" && definition.mutatesDomain) {
    throw new Error("Experimental AI capabilities cannot mutate authoritative domain state.");
  }
  return route;
}

export function capabilityRouteForId(id: string): CapabilityDefinition | undefined {
  return getCapability(id);
}
