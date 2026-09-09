import type { StudentContextSnapshot } from "./student-context";
import type { Opportunity, OpportunityMatch } from "./opportunity-types";
import { evaluateOpportunityEligibility } from "./opportunity-eligibility";
import type { OpportunityAdapter } from "./opportunity-adapter";
import { validateOpportunityRecord } from "./opportunity-adapter";

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

export type OpportunitySearchResult = {
  opportunities: Opportunity[];
  matches: OpportunityMatch[];
  sourceIds: string[];
  sourceErrors: Array<{ sourceId: string; error: string }>;
  invalidRecordCount: number;
  retrievedAt: string;
};

/** Provider-neutral orchestration. Provider retrieval/auth/parsing remains inside adapters. */
export async function searchOpportunities(
  request: OpportunitySearchRequest,
  adapters: OpportunityAdapter[],
): Promise<OpportunitySearchResult> {
  const settled = await Promise.allSettled(
    adapters.map((adapter) =>
      adapter.search({
        query: request.intent.query,
        location: request.intent.location,
        category: request.intent.category,
        asOf: request.asOf,
      }),
    ),
  );

  const sourceIds: string[] = [];
  const sourceErrors: OpportunitySearchResult["sourceErrors"] = [];
  const opportunities: Opportunity[] = [];
  let invalidRecordCount = 0;

  settled.forEach((settledResult, index) => {
    const adapter = adapters[index];
    if (!adapter) return;
    if (settledResult.status === "rejected") {
      sourceErrors.push({ sourceId: adapter.sourceId, error: "Opportunity source failed during retrieval." });
      return;
    }
    const result = settledResult.value;
    if (result.health === "ready") sourceIds.push(adapter.sourceId);
    if (result.health === "failed") {
      sourceErrors.push({ sourceId: adapter.sourceId, error: "Opportunity source failed during retrieval." });
    }
    for (const opportunity of result.opportunities) {
      if (validateOpportunityRecord(opportunity)) opportunities.push(opportunity);
      else invalidRecordCount += 1;
    }
  });

  const unique = deduplicateOpportunities(opportunities);
  const normalized: Opportunity[] = unique.map((opportunity) => ({
    ...opportunity,
    eligibility: evaluateOpportunityEligibility({
      student: request.student,
      opportunity,
      asOf: request.asOf,
    }).eligibility,
  }));

  const byId = new Map<string, Opportunity>(normalized.map((item) => [item.canonicalId, item]));

  const matches = normalized
    .map((opportunity) => matchOpportunity(opportunity, request.student))
    .sort((a, b) => {
      const fitDiff = fitRank(b.fit) - fitRank(a.fit);
      if (fitDiff !== 0) return fitDiff;
      const oppA = byId.get(a.opportunityId);
      const oppB = byId.get(b.opportunityId);
      return freshnessRank(oppB?.freshness ?? "unverified") - freshnessRank(oppA?.freshness ?? "unverified");
    });

  const ranked: Opportunity[] = [];
  for (const match of matches) {
    const opportunity = byId.get(match.opportunityId);
    if (opportunity) ranked.push(opportunity);
  }

  return {
    opportunities: ranked,
    matches,
    sourceIds,
    sourceErrors,
    invalidRecordCount,
    retrievedAt: request.asOf,
  };
}

function fitRank(fit: OpportunityMatch["fit"]): number {
  return fit === "high" ? 3 : fit === "medium" ? 2 : fit === "low" ? 1 : 0;
}

function freshnessRank(freshness: Opportunity["freshness"]): number {
  return freshness === "fresh" ? 3 : freshness === "aging" ? 2 : freshness === "stale" ? 1 : 0;
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

const STOP_WORDS = new Set(["msc", "bsc", "master", "masters", "bachelor", "bachelors", "in", "of", "and", "the", "for", "with", "degree", "program", "programme", "studies", "studies"]);

function extractKeywords(phrase?: string): string[] {
  if (!phrase) return [];
  return normalizedKey(phrase)
    .split(/[\s,/-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function matchOpportunity(opportunity: Opportunity, student: StudentContextSnapshot): OpportunityMatch {
  const constraints: OpportunityMatch["constraints"] = [];
  const reasons: string[] = [];

  const course = normalizedKey(student.education.course);
  const courseTokens = extractKeywords(student.education.course);
  const text = normalizedKey(
    [
      opportunity.title,
      opportunity.requiredEducation?.join(" "),
      opportunity.requiredSkills?.join(" "),
      opportunity.preferredSkills?.join(" "),
    ]
      .filter(Boolean)
      .join(" "),
  );

  const exactCourseMatch = Boolean(course && text.includes(course));
  const tokenMatches = courseTokens.filter((token) => text.includes(token));
  const courseMatch = exactCourseMatch || tokenMatches.length > 0;

  constraints.push({
    kind: "course",
    status: exactCourseMatch ? "strong" : tokenMatches.length > 0 ? "acceptable" : "unknown",
    detail: exactCourseMatch
      ? "The opportunity text references the student's exact course."
      : tokenMatches.length > 0
        ? `Matched field keywords: ${tokenMatches.join(", ")}.`
        : "Course-level fit is not established from the available source data.",
  });
  if (courseMatch) reasons.push("course relevance");

  const destination = normalizedKey(student.destination.city ?? student.destination.country);
  const locationText = normalizedKey(opportunity.location);
  const locationMatch = Boolean(
    (destination && locationText.includes(destination)) ||
    (destination === "paris" && (locationText.includes("paris") || locationText.includes("75") || locationText.includes("ile-de-france"))),
  );

  constraints.push({
    kind: "location",
    status: locationMatch ? "strong" : "unknown",
    detail: locationMatch
      ? "The opportunity location matches the student's destination context."
      : "Location compatibility is not established from the available source data.",
  });
  if (locationMatch) reasons.push("location");

  const workAuthDetail =
    opportunity.eligibility === "eligible"
      ? "Eligibility is established by the deterministic policy layer."
      : "Work authorization requires verification against student visa rules (e.g. annual 964h limit).";

  constraints.push({
    kind: "work_authorization",
    status:
      opportunity.eligibility === "eligible"
        ? "strong"
        : opportunity.eligibility === "eligible_with_conditions"
          ? "acceptable"
          : "unknown",
    detail: workAuthDetail,
  });

  const strongCount = constraints.filter((c) => c.status === "strong").length;
  const acceptableCount = constraints.filter((c) => c.status === "acceptable").length;

  const fit: OpportunityMatch["fit"] =
    strongCount >= 2 ? "high" : strongCount === 1 || acceptableCount >= 1 ? "medium" : "low";

  return {
    opportunityId: opportunity.canonicalId,
    fit,
    reasons,
    constraints,
  };
}
