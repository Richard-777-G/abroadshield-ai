import { COUNTRY_RULE_MAP, type CountryRule } from "./country-rules";
import { normalizePhase, type PhaseId } from "./journey";

export type RequirementStatus = "ready" | "needs_review" | "blocked";
export type RequirementPriority = "critical" | "high" | "medium" | "info";

export interface JourneyRequirement {
  id: string;
  title: string;
  phase: PhaseId;
  status: RequirementStatus;
  priority: RequirementPriority;
  reason: string;
  nextAction: string;
  source?: { label: string; url: string };
}

export interface RequirementSnapshot {
  country: CountryRule | null;
  phase: PhaseId;
  requirements: JourneyRequirement[];
  verifiedDocuments: number;
  totalDocuments: number;
  readiness: number;
  summary: { critical: number; high: number; review: number; ready: number };
}

type Profile = {
  destination?: string;
  currentPhase?: string;
  documentsTotal?: number;
  documentsVerified?: number;
  readiness?: number;
  visaAppointment?: string | null;
  funding?: string | null;
};

const sourceFor = (country: CountryRule, index: number) => country.embassyLinks[index] ?? country.embassyLinks[0];

export function buildRequirementSnapshot(profile: Profile = {}): RequirementSnapshot {
  const country = profile.destination ? COUNTRY_RULE_MAP[profile.destination] ?? null : null;
  const phase = normalizePhase(profile.currentPhase);
  const totalDocuments = Math.max(0, profile.documentsTotal ?? 0);
  const verifiedDocuments = Math.min(totalDocuments, Math.max(0, profile.documentsVerified ?? 0));
  const readiness = Math.max(0, Math.min(100, profile.readiness ?? (totalDocuments ? Math.round((verifiedDocuments / totalDocuments) * 100) : 0)));

  if (!country) return { country: null, phase, requirements: [], verifiedDocuments, totalDocuments, readiness, summary: { critical: 0, high: 0, review: 0, ready: 0 } };

  const requirements = country.checklist.filter((item) => item.phase === phase).map((item, index): JourneyRequirement => {
    const normalized = item.item.toLowerCase();
    const fundingMissing = /fund|financial|bank statement|sperrkonto|gic/.test(normalized) && !profile.funding;
    const appointmentMissing = /appointment|interview/.test(normalized) && !profile.visaAppointment;
    const status: RequirementStatus = fundingMissing || appointmentMissing ? "blocked" : "needs_review";
    const priority: RequirementPriority = fundingMissing || appointmentMissing ? "critical" : phase === "pre-departure" ? "high" : "medium";
    const reason = fundingMissing ? "Your persistent profile does not contain funding evidence yet." : appointmentMissing ? "Your persistent profile does not contain a visa appointment yet." : "This is required by the configured destination checklist for your current journey stage.";
    const nextAction = fundingMissing ? "Add your funding evidence/details to the journey profile." : appointmentMissing ? "Add the appointment details or ask the agent to prepare the booking workflow." : "Upload or verify the supporting evidence before marking this complete.";
    return { id: `${country.country}-${phase}-${index}`, title: item.item, phase, status, priority, reason, nextAction, source: sourceFor(country, index) };
  });

  if (requirements.length === 0) requirements.push({ id: `${country.country}-${phase}-rules`, title: `${phase} rule review`, phase, status: "needs_review", priority: "info", reason: "No checklist items are currently configured for this stage in the destination rule table.", nextAction: "Ask the agent to review this stage against the official destination authority before taking action.", source: sourceFor(country, 0) });

  const summary = { critical: requirements.filter((r) => r.priority === "critical").length, high: requirements.filter((r) => r.priority === "high").length, review: requirements.filter((r) => r.status === "needs_review").length, ready: requirements.filter((r) => r.status === "ready").length };
  return { country, phase, requirements, verifiedDocuments, totalDocuments, readiness, summary };
}
