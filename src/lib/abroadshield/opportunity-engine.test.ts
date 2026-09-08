import { describe, expect, test } from "bun:test";
import { searchOpportunities, type OpportunitySearchRequest } from "./opportunity-engine";
import type { Opportunity } from "./opportunity-types";
import type { OpportunityAdapter } from "./opportunity-adapter";
import type { StudentContextSnapshot } from "./student-context";

const student: StudentContextSnapshot = {
  student: { id: "student-1", name: "Test Student" }, education: { course: "Business Analytics", university: "Example University" },
  destination: { country: "France", city: "Paris" }, journey: { phase: "studying", readiness: "ready", documentsTotal: 0, documentsVerified: 0 }, career: {}, constraints: {},
};
function opportunity(id: string, overrides: Partial<Opportunity> = {}): Opportunity { return {
  canonicalId: id, providerId: "test-provider", sourceType: "job_board", sourceUrl: `https://example.com/jobs/${id}`, title: "Business Analytics Intern", employer: "Example Labs", location: "Paris", contractType: "internship", requiredSkills: ["Business Analytics"], retrievedAt: "2026-09-08T00:00:00.000Z", freshness: "fresh", applicationCapability: "L1", eligibility: "eligible", provenance: { provider: "test-provider", sourceUrl: `https://example.com/jobs/${id}`, retrievedAt: "2026-09-08T00:00:00.000Z" }, ...overrides,
}; }
const request: OpportunitySearchRequest = { student, intent: { category: "internship", location: "Paris" }, asOf: "2026-09-08T00:00:00.000Z" };

describe("opportunity search engine", () => {
  test("combines adapters and deduplicates equivalent opportunities", async () => {
    const first: OpportunityAdapter = { sourceId: "source-a", async search() { return { health: "ready", opportunities: [opportunity("a", { sourceUrl: "https://a.example/job" })] }; } };
    const second: OpportunityAdapter = { sourceId: "source-b", async search() { return { health: "ready", opportunities: [opportunity("b", { sourceUrl: "https://a.example/job", retrievedAt: "2026-09-07T00:00:00.000Z" })] }; } };
    const result = await searchOpportunities(request, [first, second]);
    expect(result.sourceIds).toEqual(["source-a", "source-b"]); expect(result.opportunities).toHaveLength(1); expect(result.opportunities[0]?.canonicalId).toBe("a");
  });
  test("isolates a failing adapter and sanitizes its provider error", async () => {
    const good: OpportunityAdapter = { sourceId: "good", async search() { return { health: "ready", opportunities: [opportunity("good-1")] }; } };
    const bad: OpportunityAdapter = { sourceId: "bad", async search() { return { health: "failed", opportunities: [], error: "secret upstream detail" }; } };
    const result = await searchOpportunities(request, [good, bad]);
    expect(result.opportunities.map((item) => item.canonicalId)).toEqual(["good-1"]); expect(result.sourceErrors).toEqual([{ sourceId: "bad", error: "Opportunity source failed during retrieval." }]);
  });
  test("rejects invalid records at the engine boundary", async () => {
    const invalid = { ...opportunity("invalid"), providerId: "" } as Opportunity;
    const source: OpportunityAdapter = { sourceId: "source", async search() { return { health: "ready", opportunities: [invalid] }; } };
    const result = await searchOpportunities(request, [source]); expect(result.opportunities).toHaveLength(0); expect(result.invalidRecordCount).toBe(1);
  });
  test("does not treat unknown work authorization as eligible", async () => {
    const source: OpportunityAdapter = { sourceId: "source", async search() { return { health: "ready", opportunities: [opportunity("unknown", { eligibility: "requires_work_authorization_check" })] }; } };
    const result = await searchOpportunities(request, [source]); expect(result.opportunities[0]?.eligibility).toBe("requires_work_authorization_check"); expect(result.matches[0]?.constraints.find((item) => item.kind === "work_authorization")?.status).toBe("unknown");
  });
  test("produces explainable high fit when course, location and eligibility are established", async () => {
    const source: OpportunityAdapter = { sourceId: "source", async search() { return { health: "ready", opportunities: [opportunity("fit-1")] }; } };
    const result = await searchOpportunities(request, [source]); expect(result.matches[0]?.fit).toBe("high"); expect(result.matches[0]?.reasons).toEqual(["course relevance", "location"]);
  });
});
