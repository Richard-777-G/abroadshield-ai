import { describe, expect, test } from "bun:test";
import { searchOpportunities, type OpportunitySourceAdapter } from "./opportunity-engine";
import type { Opportunity } from "./opportunity-types";
import type { StudentContextSnapshot } from "./student-context";

const student: StudentContextSnapshot = {
  student: { id: "student-1", name: "Test Student" },
  education: { course: "Business Analytics", university: "Example University" },
  destination: { country: "France", city: "Paris" },
  journey: { phase: "studying", readiness: "ready", documentsTotal: 0, documentsVerified: 0 },
  career: {},
  constraints: {},
};

function opportunity(id: string, overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    canonicalId: id,
    providerId: "test-provider",
    sourceType: "job_board",
    sourceUrl: `https://example.com/jobs/${id}`,
    title: "Business Analytics Intern",
    employer: "Example Labs",
    location: "Paris",
    contractType: "internship",
    requiredSkills: ["Business Analytics"],
    retrievedAt: "2026-09-08T00:00:00.000Z",
    freshness: "fresh",
    applicationCapability: "L1",
    eligibility: "eligible",
    provenance: {
      provider: "test-provider",
      sourceUrl: `https://example.com/jobs/${id}`,
      retrievedAt: "2026-09-08T00:00:00.000Z",
    },
    ...overrides,
  };
}

describe("opportunity search engine", () => {
  test("combines adapters and deduplicates equivalent opportunities", async () => {
    const first: OpportunitySourceAdapter = {
      sourceId: "source-a",
      async search() { return [opportunity("a", { sourceUrl: "https://a.example/job" })]; },
    };
    const second: OpportunitySourceAdapter = {
      sourceId: "source-b",
      async search() { return [opportunity("b", { sourceUrl: "https://a.example/job", retrievedAt: "2026-09-07T00:00:00.000Z" })]; },
    };

    const result = await searchOpportunities(
      { student, intent: { category: "internship", location: "Paris" }, asOf: "2026-09-08T00:00:00.000Z" },
      [first, second],
    );

    expect(result.sourceIds).toEqual(["source-a", "source-b"]);
    expect(result.opportunities).toHaveLength(1);
    expect(result.opportunities[0]?.canonicalId).toBe("a");
  });

  test("isolates a failing adapter from successful sources", async () => {
    const good: OpportunitySourceAdapter = {
      sourceId: "good",
      async search() { return [opportunity("good-1")]; },
    };
    const bad: OpportunitySourceAdapter = {
      sourceId: "bad",
      async search() { throw new Error("provider unavailable"); },
    };

    const result = await searchOpportunities(
      { student, intent: { category: "internship", location: "Paris" }, asOf: "2026-09-08T00:00:00.000Z" },
      [good, bad],
    );

    expect(result.sourceIds).toEqual(["good"]);
    expect(result.opportunities.map((item) => item.canonicalId)).toEqual(["good-1"]);
  });

  test("produces explainable high fit when course and location are established", async () => {
    const source: OpportunitySourceAdapter = {
      sourceId: "source",
      async search() { return [opportunity("fit-1")]; },
    };

    const result = await searchOpportunities(
      { student, intent: { category: "internship", location: "Paris" }, asOf: "2026-09-08T00:00:00.000Z" },
      [source],
    );

    expect(result.matches[0]?.fit).toBe("high");
    expect(result.matches[0]?.reasons).toEqual(["course relevance", "location"]);
  });
});
