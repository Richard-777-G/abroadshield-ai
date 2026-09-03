import type { PhaseId } from "@/components/abroadshield/data";
import type { AgentCapability } from "./tool-registry";

export type StagePolicy = {
  phase: PhaseId;
  title: string;
  mission: string;
  objective: string;
  capabilities: readonly AgentCapability[];
  systemFocus: string;
};

export const STAGE_POLICIES: Record<PhaseId, StagePolicy> = {
  "pre-departure": {
    phase: "pre-departure",
    title: "Pre-Departure",
    mission: "Get the student ready to leave with the application, documents and required actions in order.",
    objective: "Reduce visa and departure risk by completing requirements, resolving document gaps and protecting deadlines.",
    capabilities: ["visa_check", "document_check", "deadline_scan", "draft_email"],
    systemFocus: "Prioritize official destination requirements, document evidence, appointment and application readiness, funding evidence, and time-critical pre-departure actions.",
  },
  arrival: {
    phase: "arrival",
    title: "Arrival",
    mission: "Turn the first days in the destination into a controlled setup process.",
    objective: "Complete essential arrival, accommodation, registration and local setup actions without losing deadlines.",
    capabilities: ["housing_search", "document_check", "deadline_scan", "draft_email", "visa_check"],
    systemFocus: "Prioritize arrival formalities, accommodation, local setup and destination-specific post-arrival obligations.",
  },
  studying: {
    phase: "studying",
    title: "Studying & Part-Time",
    mission: "Keep the student compliant, funded and academically on track while managing part-time work.",
    objective: "Protect study progress and immigration compliance while making legitimate part-time decisions.",
    capabilities: ["deadline_scan", "document_check", "draft_email", "job_search", "housing_search", "visa_check"],
    systemFocus: "Prioritize academic deadlines, work restrictions, funding, housing continuity and current immigration conditions relevant to the student's status.",
  },
  "job-success": {
    phase: "job-success",
    title: "Job Success",
    mission: "Convert study experience into a compliant career path.",
    objective: "Find suitable roles, improve applications, build outreach and protect the post-study immigration runway.",
    capabilities: ["job_search", "tailor_cv", "draft_email", "deadline_scan", "visa_check"],
    systemFocus: "Prioritize sponsorship and eligibility signals, role fit, application quality, networking follow-up and post-study visa timing.",
  },
};

export function getStagePolicy(phase: PhaseId): StagePolicy {
  return STAGE_POLICIES[phase];
}

export function isCapabilityAllowedInStage(phase: PhaseId, capability: AgentCapability): boolean {
  return STAGE_POLICIES[phase].capabilities.includes(capability);
}

export function buildStageSystemDirective(phase: PhaseId): string {
  const policy = getStagePolicy(phase);
  return [
    `ACTIVE STAGE: ${policy.title}`,
    `MISSION: ${policy.mission}`,
    `OBJECTIVE: ${policy.objective}`,
    `SYSTEM FOCUS: ${policy.systemFocus}`,
    `ALLOWED CAPABILITIES: ${policy.capabilities.join(", ")}`,
    "The student may inspect and plan for later stages, but operational recommendations should prioritize the active stage.",
    "Never claim completion unless an executor returns a result and that result is persisted.",
  ].join("\n");
}
