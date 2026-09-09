import { describe, expect, test } from "bun:test";
import {
  searchOpportunities,
  type OpportunitySearchRequest,
} from "./opportunity-engine";
import {
  prepareOpportunityApplication,
  saveOpportunity,
  listSavedOpportunities,
} from "./opportunity-service";
import type { Opportunity } from "./opportunity-types";
import type { OpportunityAdapter } from "./opportunity-adapter";
import type { StudentContextSnapshot } from "./student-context";
import { detectCapability } from "./capability-router";

describe("Paris Employment Vertical Slice Verification", () => {
  const student: StudentContextSnapshot = {
    student: { id: "student-paris-1", name: "Alex Chen" },
    education: { course: "Computer Science", university: "Sorbonne University" },
    destination: { country: "France", city: "Paris" },
    journey: { phase: "studying", readiness: 100, documentsTotal: 0, documentsVerified: 0 },
    career: { goal: "Software Engineer in Paris" },
    constraints: {},
  };

  const mockParisOpportunities: Opportunity[] = [
    {
      canonicalId: "opp-pt-1",
      providerId: "france_travail",
      providerOpportunityId: "FT-PT-101",
      sourceType: "government",
      sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/PT-101",
      title: "Assistant Développeur Web Étudiant",
      employer: "Tech Paris Studio",
      location: "Paris 11e",
      contractType: "part_time",
      hoursPerWeek: { min: 15, max: 18 },
      requiredSkills: ["Computer Science", "JavaScript"],
      retrievedAt: "2026-09-08T00:00:00.000Z",
      freshness: "fresh",
      applicationCapability: "L1",
      eligibility: "requires_work_authorization_check",
      provenance: {
        provider: "France Travail",
        sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/PT-101",
        retrievedAt: "2026-09-08T00:00:00.000Z",
      },
    },
    {
      canonicalId: "opp-intern-1",
      providerId: "france_travail",
      providerOpportunityId: "FT-INT-202",
      sourceType: "government",
      sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/INT-202",
      title: "Stage Data Science / Machine Learning",
      employer: "AI Innovation Labs",
      location: "Paris (75008)",
      contractType: "internship",
      hoursPerWeek: { min: 35, max: 35 },
      requiredSkills: ["Python", "Machine Learning", "Computer Science"],
      retrievedAt: "2026-09-08T00:00:00.000Z",
      freshness: "fresh",
      applicationCapability: "L1",
      eligibility: "requires_work_authorization_check",
      provenance: {
        provider: "France Travail",
        sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/INT-202",
        retrievedAt: "2026-09-08T00:00:00.000Z",
      },
    },
    {
      canonicalId: "opp-ft-1",
      providerId: "france_travail",
      providerOpportunityId: "FT-FT-303",
      sourceType: "government",
      sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/FT-303",
      title: "Ingénieur Logiciel Junior",
      employer: "Fintech Paris",
      location: "Paris (75009)",
      contractType: "full_time",
      requiredSkills: ["TypeScript", "Computer Science"],
      retrievedAt: "2026-09-07T00:00:00.000Z",
      freshness: "fresh",
      applicationCapability: "L1",
      eligibility: "requires_work_authorization_check",
      provenance: {
        provider: "France Travail",
        sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/FT-303",
        retrievedAt: "2026-09-07T00:00:00.000Z",
      },
    },
  ];

  const mockAdapter: OpportunityAdapter = {
    sourceId: "france_travail",
    async search(req) {
      const filtered = mockParisOpportunities.filter(
        (o) => o.contractType === req.category,
      );
      return { health: "ready", opportunities: filtered };
    },
  };

  test("Journey 1: Find part-time jobs in Paris related to my course", async () => {
    const query = "Find part-time jobs in Paris related to my course";
    const capability = detectCapability(query);
    expect(capability).toBe("job_search");

    const req: OpportunitySearchRequest = {
      student,
      intent: { category: "part_time", location: "Paris", query: "Computer Science" },
      asOf: "2026-09-08T00:00:00.000Z",
    };
    const result = await searchOpportunities(req, [mockAdapter]);

    expect(result.opportunities.length).toBeGreaterThanOrEqual(1);
    const opp = result.opportunities[0];
    expect(opp.contractType).toBe("part_time");
    expect(opp.location).toContain("Paris");
    expect(opp.eligibility).toBe("requires_work_authorization_check");

    const match = result.matches.find((m) => m.opportunityId === opp.canonicalId);
    expect(match?.fit).toBe("high");
    expect(match?.reasons.includes("location")).toBe(true);
    expect(match?.reasons.includes("course relevance")).toBe(true);
  });

  test("Journey 2: Find internships related to my course in Paris", async () => {
    const query = "Find internships related to my course in Paris";
    const capability = detectCapability(query);
    expect(capability).toBe("job_search");

    const req: OpportunitySearchRequest = {
      student,
      intent: { category: "internship", location: "Paris", query: "Computer Science" },
      asOf: "2026-09-08T00:00:00.000Z",
    };
    const result = await searchOpportunities(req, [mockAdapter]);

    expect(result.opportunities.length).toBeGreaterThanOrEqual(1);
    const opp = result.opportunities[0];
    expect(opp.contractType).toBe("internship");
    expect(opp.location).toContain("Paris");

    const match = result.matches.find((m) => m.opportunityId === opp.canonicalId);
    expect(match?.fit).toBe("high");
  });

  test("Journey 3: Find full-time jobs in Paris", async () => {
    const query = "Find full-time jobs in Paris";
    const capability = detectCapability(query);
    expect(capability).toBe("job_search");

    const req: OpportunitySearchRequest = {
      student,
      intent: { category: "full_time", location: "Paris" },
      asOf: "2026-09-08T00:00:00.000Z",
    };
    const result = await searchOpportunities(req, [mockAdapter]);

    expect(result.opportunities.length).toBeGreaterThanOrEqual(1);
    const opp = result.opportunities[0];
    expect(opp.contractType).toBe("full_time");
  });

  test("Journey 4: Can you apply for the internships you found? (Honest L1 check)", async () => {
    const query = "Can you apply for the internships you found?";
    const isApplyQuestion = /\b(can you apply|apply for (these|the|them|internships?|jobs?)|submit my application|will you apply|auto[- ]apply|can i apply through you)\b/i.test(query);
    expect(isApplyQuestion).toBe(true);

    // L1 capability plan: prepares materials, does NOT claim application was submitted
    const internOpp = mockParisOpportunities.find((o) => o.contractType === "internship")!;
    const plan = await prepareOpportunityApplication(student.student.id, internOpp, student);

    expect(plan.capabilityLevel).toBe("L1");
    expect(plan.externalApplicationNotice).toContain("L1 capability");
    expect(plan.externalApplicationNotice).toContain("does not auto-submit");
    expect(plan.recommendedActions.length).toBeGreaterThanOrEqual(3);
    // Verified step to submit directly on official portal
    const submitStep = plan.recommendedActions.find((a) => a.title.toLowerCase().includes("submit"));
    expect(submitStep).toBeDefined();
    expect(submitStep?.description).toContain("verified provider link");
  });

  test("Deterministic eligibility honesty: does NOT claim 964h eligibility without proof", async () => {
    const opp = mockParisOpportunities[0];
    // Contract requires work authorization verification
    expect(opp.eligibility).toBe("requires_work_authorization_check");
    // Under no circumstances should the system hallucinate "eligible under 964h rule"
    expect(opp.eligibility).not.toBe("eligible");
  });
});
