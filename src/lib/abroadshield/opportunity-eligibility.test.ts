import { describe, expect, test } from "bun:test";
import { evaluateOpportunityEligibility } from "./opportunity-eligibility";
import type { Opportunity } from "./opportunity-types";
import type { StudentContextSnapshot } from "./student-context";

const student: StudentContextSnapshot = {
  student: { id: "student-1" },
  education: { course: "Business Analytics" },
  destination: { country: "France", city: "Paris" },
  journey: { phase: "studying", readiness: 100, documentsTotal: 0, documentsVerified: 0 },
  career: {},
  constraints: {},
};

const opportunity: Opportunity = {
  canonicalId: "test:1", providerId: "test", sourceType: "government", sourceUrl: "https://example.com/1",
  title: "Intern", employer: "Example", contractType: "internship", retrievedAt: "2026-09-08T00:00:00.000Z",
  freshness: "fresh", applicationCapability: "L1", eligibility: "requires_work_authorization_check",
  provenance: { provider: "test", sourceUrl: "https://example.com/1", retrievedAt: "2026-09-08T00:00:00.000Z" },
};

describe("opportunity eligibility", () => {
  test("does not treat unknown work authorization as eligible", () => {
    const result = evaluateOpportunityEligibility({ student, opportunity, asOf: "2026-09-08T00:00:00.000Z" });
    expect(result.eligibility).toBe("requires_work_authorization_check");
    expect(result.requiresManualReview).toBe(true);
  });

  test("accepts an opportunity only when eligibility is explicitly established", () => {
    const result = evaluateOpportunityEligibility({
      student,
      opportunity: { ...opportunity, eligibility: "eligible" },
      asOf: "2026-09-08T00:00:00.000Z",
    });
    expect(result.eligibility).toBe("eligible");
    expect(result.requiresManualReview).toBe(false);
  });

  test("preserves deterministic rejection", () => {
    const result = evaluateOpportunityEligibility({
      student,
      opportunity: { ...opportunity, eligibility: "not_eligible" },
      asOf: "2026-09-08T00:00:00.000Z",
    });
    expect(result.eligibility).toBe("not_eligible");
    expect(result.policyChecks[0]?.status).toBe("fail");
  });
});
