import { describe, expect, test } from "bun:test";
import {
  prepareOpportunityApplication,
  type ApplicationPreparationPlan,
} from "./opportunity-service";
import type { Opportunity } from "./opportunity-types";
import type { StudentContextSnapshot } from "./student-context";

describe("Opportunity Service Application Preparation", () => {
  const mockStudent: StudentContextSnapshot = {
    student: { id: "test-user-id", name: "Test Student" },
    education: { course: "Computer Science", university: "Sorbonne University" },
    destination: { country: "France", city: "Paris" },
    journey: { phase: "studying", readiness: 100, documentsTotal: 0, documentsVerified: 0 },
    career: {},
    constraints: {},
  };

  const sampleOpportunity: Opportunity = {
    canonicalId: "opp-paris-tech-intern",
    providerId: "france_travail",
    providerOpportunityId: "FT-12345",
    sourceType: "government",
    sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/12345",
    title: "Stage Développeur Web / Data",
    employer: "TechCorp Paris",
    location: "Paris (75002)",
    contractType: "internship",
    hoursPerWeek: { min: 35, max: 35 },
    salary: { min: 900, max: 1100, currency: "EUR", period: "month" },
    requiredSkills: ["TypeScript", "Python", "SQL"],
    freshness: "fresh",
    applicationCapability: "L1",
    retrievedAt: "2026-09-08T00:00:00.000Z",
    provenance: {
      provider: "France Travail",
      sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/12345",
      retrievedAt: "2026-09-08T00:00:00.000Z",
    },
  };

  test("produces an L1 preparation plan with tailoring prompts and no false submission", async () => {
    const plan: ApplicationPreparationPlan = await prepareOpportunityApplication(
      "test-user-id",
      sampleOpportunity,
      mockStudent,
    );

    expect(plan.opportunityId).toBe("opp-paris-tech-intern");
    expect(plan.title).toBe("Stage Développeur Web / Data");
    expect(plan.employer).toBe("TechCorp Paris");
    expect(plan.capabilityLevel).toBe("L1");

    // Must explicitly declare external application notice
    expect(plan.externalApplicationNotice).toContain("L1 capability");
    expect(plan.externalApplicationNotice).toContain("does not auto-submit");

    // Key keywords must include skills
    expect(plan.analysis.keyKeywords).toContain("TypeScript");
    expect(plan.analysis.keyKeywords).toContain("Python");

    // Must have structured preparation steps
    expect(plan.recommendedActions.length).toBeGreaterThanOrEqual(3);
    const stepTitles = plan.recommendedActions.map((a) => a.title);
    expect(stepTitles.some((t) => t.toLowerCase().includes("cv"))).toBe(true);
    expect(stepTitles.some((t) => t.toLowerCase().includes("motivation"))).toBe(true);
    expect(stepTitles.some((t) => t.toLowerCase().includes("official"))).toBe(true);
  });

  test("handles part-time opportunities by highlighting 964h compliance check", async () => {
    const partTimeOpp: Opportunity = {
      ...sampleOpportunity,
      canonicalId: "opp-paris-pt-barista",
      title: "Student Assistant / Barista",
      contractType: "part_time",
    };

    const plan = await prepareOpportunityApplication(
      "test-user-id",
      partTimeOpp,
      mockStudent,
    );
    const gaps = plan.analysis.potentialGaps.join(" ");
    expect(gaps).toContain("964-hour");
  });
});
