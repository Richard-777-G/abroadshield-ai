import type { PhaseId } from "./phase";
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
    phase: "pre-departure", title: "Pre-Departure",
    mission: "Get the student ready to leave with the application, documents and required actions in order.",
    objective: "Reduce visa and departure risk by completing requirements, resolving document gaps and protecting deadlines.",
    capabilities: ["visa_check", "document_check", "deadline_scan", "draft_email"],
    systemFocus: "Prioritize official destination requirements, document evidence, appointment and application readiness, funding evidence, and time-critical pre-departure actions.",
  },
  arrival: {
    phase: "arrival", title: "Arrival",
    mission: "Turn the first days in the destination into a controlled setup process.",
    objective: "Complete essential arrival, accommodation, registration and local setup actions without losing deadlines.",
    capabilities: ["housing_search", "document_check", "deadline_scan", "draft_email", "visa_check"],
    systemFocus: "Prioritize arrival formalities, accommodation, local setup and destination-specific post-arrival obligations.",
  },
  studying: {
    phase: "studying", title: "Studying & Part-Time",
    mission: "Keep the student compliant, funded and academically on track while managing part-time work.",
    objective: "Protect study progress and immigration compliance while making legitimate part-time decisions.",
    capabilities: ["deadline_scan", "document_check", "draft_email", "job_search", "housing_search", "visa_check"],
    systemFocus: "Prioritize academic deadlines, work restrictions, funding, housing continuity and current immigration conditions relevant to the student's status.",
  },
  "job-success": {
    phase: "job-success", title: "Job Success",
    mission: "Convert study experience into a compliant career path.",
    objective: "Find suitable roles, improve applications, build outreach and protect the post-study immigration runway.",
    capabilities: ["job_search", "tailor_cv", "draft_email", "deadline_scan", "visa_check"],
    systemFocus: "Prioritize sponsorship and eligibility signals, role fit, application quality, networking follow-up and post-study visa timing.",
  },
};

export function getStagePolicy(phase: PhaseId): StagePolicy { return STAGE_POLICIES[phase]; }

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

export function buildWholeJourneyDirective(currentPhase: PhaseId): string {
  return [
    "WHOLE JOURNEY MAP:",
    ...Object.values(STAGE_POLICIES).map((policy) => {
      const marker = policy.phase === currentPhase ? "CURRENT" : policy.phase === "pre-departure" ? "FOUNDATION" : "FUTURE";
      return `- [${marker}] ${policy.title}: ${policy.objective} Capabilities: ${policy.capabilities.join(", ")}.`;
    }),
    "The student may ask about any stage at any time.",
    "Planning or explaining a future stage is not the same as executing a task in that stage.",
    "When the student asks what happens next, explain the relevant future stage and how current actions prepare for it.",
  ].join("\n");
}

export function isExplorationRequest(message: string): boolean {
  const text = message.trim().toLowerCase();
  if (!text) return false;
  return /\b(what('s| is| are)|how (does|will|can)|what happens|what comes next|later|future|plan|roadmap|path|career path|journey|next stage|next phases|long[- ]term|after (i|my) (study|course|arrival)|prepare for)\b/.test(text);
}
