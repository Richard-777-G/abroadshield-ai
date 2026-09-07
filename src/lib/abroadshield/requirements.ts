import { COUNTRY_RULE_MAP, type CountryRule } from "./country-rules";
import { normalizePhase, type PhaseId, countryContext } from "./journey";
import { getCountryPolicyRegistry } from "./country-policy-catalog";
import type { EvidenceVerificationState } from "./policy-versioning";
import { isValidCalendarDate } from "./date-validation";

export type RequirementStatus = "ready" | "needs_review" | "blocked";
export type RequirementPriority = "critical" | "high" | "medium" | "info";

export interface RequirementPolicyEvidence {
  ruleId: string;
  ruleVersionId: string | null;
  status: EvidenceVerificationState;
  authority: string | null;
  sourceUrl: string | null;
  reason?: string;
}

export interface JourneyRequirement {
  id: string;
  title: string;
  phase: PhaseId;
  status: RequirementStatus;
  priority: RequirementPriority;
  reason: string;
  nextAction: string;
  source?: { label: string; url: string };
  policyEvidence?: RequirementPolicyEvidence;
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
  asOf?: string;
};

const sourceFor = (country: CountryRule, index: number) => country.embassyLinks[index] ?? country.embassyLinks[0];

const POLICY_BY_CHECKLIST_TEXT: Record<string, { ruleId: string; topic: string }> = {
  "validate vls-ts online within 3 months": { ruleId: "fr-vls-ts-validation-3-months", topic: "vls-ts-validation" },
};

function countryRuleFor(destination: string | undefined): CountryRule | null {
  if (!destination) return null;
  const normalized = destination.trim().toLowerCase();
  return Object.values(COUNTRY_RULE_MAP).find((country) => country.country.trim().toLowerCase() === normalized) ?? null;
}

function policyEvidenceFor(destination: string | undefined, phase: PhaseId, title: string, asOf: string): RequirementPolicyEvidence | undefined {
  const policy = POLICY_BY_CHECKLIST_TEXT[title.trim().toLowerCase()];
  if (!policy) return undefined;
  const registry = getCountryPolicyRegistry(destination);
  if (!registry) return undefined;
  const context = countryContext(destination);
  const selection = registry.current(policy.ruleId, {
    asOf,
    country: context.code,
    jurisdiction: context.code,
    phase,
    topic: policy.topic,
  });
  return {
    ruleId: policy.ruleId,
    ruleVersionId: selection.rule?.id ?? null,
    status: selection.status,
    authority: selection.rule?.source.authority ?? null,
    sourceUrl: selection.rule?.source.canonicalUrl ?? null,
    reason: selection.reason,
  };
}

export function buildRequirementSnapshot(profile: Profile = {}): RequirementSnapshot {
  const country = countryRuleFor(profile.destination);
  const phase = normalizePhase(profile.currentPhase);
  const totalDocuments = Math.max(0, profile.documentsTotal ?? 0);
  const verifiedDocuments = Math.min(totalDocuments, Math.max(0, profile.documentsVerified ?? 0));
  const readiness = Math.max(0, Math.min(100, profile.readiness ?? (totalDocuments ? Math.round((verifiedDocuments / totalDocuments) * 100) : 0)));
  const asOf = profile.asOf ?? new Date().toISOString().slice(0, 10);
  if (!isValidCalendarDate(asOf)) throw new Error("Requirement snapshot requires a valid asOf date (YYYY-MM-DD).");

  if (!country) return { country: null, phase, requirements: [], verifiedDocuments, totalDocuments, readiness, summary: { critical: 0, high: 0, review: 0, ready: 0 } };

  const requirements = country.checklist.filter((item) => item.phase === phase).map((item, index): JourneyRequirement => {
    const normalized = item.item.toLowerCase();
    const fundingMissing = /fund|financial|bank statement|sperrkonto|gic/.test(normalized) && !profile.funding;
    const appointmentMissing = /appointment|interview/.test(normalized) && !profile.visaAppointment;
    const evidence = policyEvidenceFor(profile.destination, phase, item.item, asOf);
    const policyNeedsReview = evidence && evidence.status !== "VERIFIED" && evidence.status !== "PROVISIONALLY_VERIFIED";
    const blocked = fundingMissing || appointmentMissing;
    const status: RequirementStatus = blocked ? "blocked" : policyNeedsReview ? "needs_review" : "ready";
    const priority: RequirementPriority = blocked ? "critical" : policyNeedsReview ? "high" : phase === "pre-departure" ? "high" : "medium";
    const reason = fundingMissing ? "Your persistent profile does not contain funding evidence yet." : appointmentMissing ? "Your persistent profile does not contain a visa appointment yet." : policyNeedsReview ? `Policy evidence requires review: ${evidence?.reason ?? evidence?.status}.` : "This requirement is sourced from the configured destination journey checklist and has no current evidence conflict or verification blocker.";
    const nextAction = fundingMissing ? "Add your funding evidence/details to the journey profile." : appointmentMissing ? "Add the appointment details or ask the agent to prepare the booking workflow." : policyNeedsReview ? "Review the authoritative source and establish the applicable policy before relying on this requirement." : "Proceed with the requirement and attach supporting evidence when it becomes available.";
    return { id: `${country.country}-${phase}-${index}`, title: item.item, phase, status, priority, reason, nextAction, source: sourceFor(country, index), policyEvidence: evidence };
  });

  if (requirements.length === 0) requirements.push({ id: `${country.country}-${phase}-rules`, title: `${phase} rule review`, phase, status: "needs_review", priority: "info", reason: "No checklist items are currently configured for this stage in the destination rule table.", nextAction: "Ask the agent to review this stage against the official destination authority before taking action.", source: sourceFor(country, 0) });

  const summary = { critical: requirements.filter((r) => r.priority === "critical").length, high: requirements.filter((r) => r.priority === "high").length, review: requirements.filter((r) => r.status === "needs_review").length, ready: requirements.filter((r) => r.status === "ready").length };
  return { country, phase, requirements, verifiedDocuments, totalDocuments, readiness, summary };
}
