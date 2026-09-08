import type { StudentContextSnapshot } from "./student-context";
import type { Opportunity, OpportunityMatch } from "./opportunity-types";

export type OpportunityIntent = {
  category: "part_time" | "full_time" | "internship" | "apprenticeship" | "temporary" | "freelance" | "any";
  location?: string;
  radiusKm?: number;
  query?: string;
  remote?: boolean;
};

export type OpportunitySearchRequest = {
  student: StudentContextSnapshot;
  intent: OpportunityIntent;
  asOf: string;
};

export type OpportunitySourceAdapter = {
  sourceId: string;
  search(request: OpportunitySearchRequest): Promise<Opportunity[]>;
};

export type OpportunitySearchResult = {
  opportunities: Opportunity[];
  matches: OpportunityMatch[];
  sourceIds: string[];
  retrievedAt: string;
};

/**
 * Orchestrates source adapters without knowing provider-specific HTTP, parsing or auth details.
 * Adapters must return provenance-bearing canonical opportunities; no synthetic listings are allowed.
 */
export async function searchOpportunities(
  request: OpportunitySearchRequest,
  adapters: OpportunitySourceAdapter[],
): Promise<OpportunitySearchResult> {
  const retrievedAt = request.asOf;
  const settled = await Promise.allSettled(adapters.map((adapter) => adapter.search(request)));
  const sourceIds: string[] = [];
  const opportunities: Opportunity[] = [];

  settled.forEach((result, index) => {
    const adapter = adapters[index];
    if (result.status === "fulfilled") {
      sourceIds.push(adapter.sourceId);
      opportunities.push(...result.value);
    }
  });

  const unique = deduplicateOpportunities(opportunities);
  const matches = unique.map((opportunity) => matchOpportunity(opportunity, request.student));
  matches.sort((a, b) => fitRank(b.fit) - fitRank(a.fit));
  const byId = new Map(unique.map((item) => [item.canonicalId, item]));
  const ranked = matches.map((match) => byId.get(match.opportunityId)).filter((item): item is Opportunity => Boolean(item));

  return { opportunities: ranked, matches, sourceIds, retrievedAt };
}

function fitRank(fit: OpportunityMatch["fit"]): number {
  return fit === "high" ? 3 : fit === "medium" ? 2 : fit === "low" ? 1 : 0;
}

function normalizedKey(value?: string): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function dedupeKey(opportunity: Opportunity): string {
  return [
    normalizedKey(opportunity.employer),
    normalizedKey(opportunity.title),
    normalizedKey(opportunity.location),
    opportunity.contractType,
    normalizedKey(opportunity.applicationUrl ?? opportunity.sourceUrl),
  ].join("|");
}

function deduplicateOpportunities(items: Opportunity[]): Opportunity[] {
  const seen = new Map<string, Opportunity>();
  for (const item of items) {
    const key = dedupeKey(item);
    const existing = seen.get(key);
    if (!existing || new Date(item.retrievedAt).getTime() > new Date(existing.retrievedAt).getTime()) {
      seen.set(key, item);
    }
  }
  return [...seen.values()];
}

function matchOpportunity(opportunity: Opportunity, student: StudentContextSnapshot): OpportunityMatch {
  const constraints: OpportunityMatch["constraints"] = [];
  const reasons: string[] = [];

  const course = normalizedKey(student.education.course);
  const text = normalizedKey([
    opportunity.title,
    opportunity.requiredEducation?.join(" "),
    opportunity.requiredSkills?.join(" "),
    opportunity.preferredSkills?.join(" "),
  ].filter(Boolean).join(" "));
  const courseMatch = Boolean(course && text.includes(course));
  constraints.push({ kind: "course", status: courseMatch ? "strong" : course ? "unknown" : "unknown", detail: courseMatch ? "The opportunity text references the student's course." : "Course-level fit is not established from the available source data." });
  if (courseMatch) reasons.push("course relevance");

  const destination = normalizedKey(student.destination.city ?? student.destination.country);
  const locationMatch = Boolean(destination && normalizedKey(opportunity.location).includes(destination));
  constraints.push({ kind: "location", status: locationMatch ? "strong" : destination ? "unknown" : "unknown", detail: locationMatch ? "The opportunity location matches the student's destination context." : "Location compatibility is not established from the available source data." });
  if (locationMatch) reasons.push("location");

  const eligibility = opportunity.eligibility;
  constraints.push({
    kind: "work_authorization",
    status: eligibility === "eligible" ? "strong" : eligibility === "eligible_with_conditions" ? "acceptable" : "unknown",
    detail: eligibility === "eligible" ? "Eligibility is marked eligible by the deterministic policy layer." : "Work authorization is not established by this opportunity record.",
  });

  const strong = constraints.filter((constraint) => constraint.status === "strong").length;
  const fit: OpportunityMatch["fit"] = strong >= 2 ? "high" : strong === 1 ? "medium" : "unknown";
  return { opportunityId: opportunity.canonicalId, fit, reasons, constraints };
}
