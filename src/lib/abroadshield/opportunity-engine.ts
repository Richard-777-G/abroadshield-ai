import type { StudentContextSnapshot } from "./student-context";
import type { Opportunity, OpportunityMatch } from "./opportunity-types";
import { evaluateOpportunityEligibility } from "./opportunity-eligibility";
import type { OpportunityAdapter } from "./opportunity-adapter";
import { validateOpportunityRecord } from "./opportunity-adapter";

export type OpportunityIntent = {
  category: "part_time" | "full_time" | "internship" | "apprenticeship" | "temporary" | "freelance" | "any";
  location?: string; radiusKm?: number; query?: string; remote?: boolean;
};
export type OpportunitySearchRequest = { student: StudentContextSnapshot; intent: OpportunityIntent; asOf: string };
export type OpportunitySearchResult = {
  opportunities: Opportunity[]; matches: OpportunityMatch[]; sourceIds: string[];
  sourceErrors: Array<{ sourceId: string; error: string }>; invalidRecordCount: number; retrievedAt: string;
};

/** Provider-neutral orchestration. Provider retrieval/auth/parsing remains inside adapters. */
export async function searchOpportunities(request: OpportunitySearchRequest, adapters: OpportunityAdapter[]): Promise<OpportunitySearchResult> {
  const settled = await Promise.allSettled(adapters.map((adapter) => adapter.search({ query: request.intent.query, location: request.intent.location, category: request.intent.category, asOf: request.asOf })));
  const sourceIds: string[] = [], sourceErrors: OpportunitySearchResult["sourceErrors"] = [], opportunities: Opportunity[] = [];
  let invalidRecordCount = 0;
  settled.forEach((settledResult, index) => {
    const adapter = adapters[index]; if (!adapter) return;
    if (settledResult.status === "rejected") { sourceErrors.push({ sourceId: adapter.sourceId, error: "Opportunity source failed during retrieval." }); return; }
    const result = settledResult.value;
    if (result.health === "ready") sourceIds.push(adapter.sourceId);
    if (result.health === "failed") sourceErrors.push({ sourceId: adapter.sourceId, error: "Opportunity source failed during retrieval." });
    for (const opportunity of result.opportunities) {
      if (validateOpportunityRecord(opportunity)) opportunities.push(opportunity); else invalidRecordCount += 1;
    }
  });

  const unique = deduplicateOpportunities(opportunities);
  const normalized: Opportunity[] = unique.map((opportunity) => ({
    ...opportunity,
    eligibility: evaluateOpportunityEligibility({ student: request.student, opportunity, asOf: request.asOf }).eligibility,
  }));
  const matches = normalized.map((opportunity) => matchOpportunity(opportunity, request.student)).sort((a, b) => fitRank(b.fit) - fitRank(a.fit));
  const byId = new Map<string, Opportunity>(normalized.map((item) => [item.canonicalId, item]));
  const ranked: Opportunity[] = [];
  for (const match of matches) {
    const opportunity = byId.get(match.opportunityId);
    if (opportunity) ranked.push(opportunity);
  }
  return { opportunities: ranked, matches, sourceIds, sourceErrors, invalidRecordCount, retrievedAt: request.asOf };
}

function fitRank(fit: OpportunityMatch["fit"]): number { return fit === "high" ? 3 : fit === "medium" ? 2 : fit === "low" ? 1 : 0; }
function normalizedKey(value?: string): string { return (value ?? "").trim().toLowerCase().replace(/\s+/g, " "); }
function dedupeKey(opportunity: Opportunity): string { return [normalizedKey(opportunity.employer), normalizedKey(opportunity.title), normalizedKey(opportunity.location), opportunity.contractType, normalizedKey(opportunity.applicationUrl ?? opportunity.sourceUrl)].join("|"); }
function deduplicateOpportunities(items: Opportunity[]): Opportunity[] {
  const seen = new Map<string, Opportunity>();
  for (const item of items) { const key = dedupeKey(item), existing = seen.get(key); if (!existing || new Date(item.retrievedAt).getTime() > new Date(existing.retrievedAt).getTime()) seen.set(key, item); }
  return [...seen.values()];
}
function matchOpportunity(opportunity: Opportunity, student: StudentContextSnapshot): OpportunityMatch {
  const constraints: OpportunityMatch["constraints"] = [], reasons: string[] = [];
  const course = normalizedKey(student.education.course);
  const text = normalizedKey([opportunity.title, opportunity.requiredEducation?.join(" "), opportunity.requiredSkills?.join(" "), opportunity.preferredSkills?.join(" ")].filter(Boolean).join(" "));
  const courseMatch = Boolean(course && text.includes(course));
  constraints.push({ kind: "course", status: courseMatch ? "strong" : "unknown", detail: courseMatch ? "The opportunity text references the student's course." : "Course-level fit is not established from the available source data." });
  if (courseMatch) reasons.push("course relevance");
  const destination = normalizedKey(student.destination.city ?? student.destination.country);
  const locationMatch = Boolean(destination && normalizedKey(opportunity.location).includes(destination));
  constraints.push({ kind: "location", status: locationMatch ? "strong" : "unknown", detail: locationMatch ? "The opportunity location matches the student's destination context." : "Location compatibility is not established from the available source data." });
  if (locationMatch) reasons.push("location");
  constraints.push({ kind: "work_authorization", status: opportunity.eligibility === "eligible" ? "strong" : opportunity.eligibility === "eligible_with_conditions" ? "acceptable" : "unknown", detail: opportunity.eligibility === "eligible" ? "Eligibility is established by the deterministic policy layer." : "Work authorization is not established by the deterministic policy layer." });
  const strong = constraints.filter((constraint) => constraint.status === "strong").length;
  return { opportunityId: opportunity.canonicalId, fit: strong >= 2 ? "high" : strong === 1 ? "medium" : "unknown", reasons, constraints };
}
