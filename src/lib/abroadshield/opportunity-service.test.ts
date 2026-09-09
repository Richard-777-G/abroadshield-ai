import { describe, expect, test } from "bun:test";
import {
  prepareOpportunityApplication,
  saveOpportunity,
  listSavedOpportunities,
  type ApplicationPreparationPlan,
} from "./opportunity-service";
import type { Opportunity } from "./opportunity-types";
import type { StudentContextSnapshot } from "./student-context";
import { db } from "@/lib/db";

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

  test("verifies full Save -> Persist -> Retrieve round trip", async () => {
    const memoryStore: any[] = [];
    const eventStore: any[] = [];

    (db as any).journeyTask = {
      findFirst: async ({ where }: any) => {
        return (
          memoryStore.find(
            (t) =>
              t.userId === where.userId &&
              t.type === where.type &&
              t.title === where.title,
          ) || null
        );
      },
      create: async ({ data }: any) => {
        const record = {
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.push(record);
        return record;
      },
      findMany: async ({ where }: any) => {
        return memoryStore.filter(
          (t) => t.userId === where.userId && t.type === where.type,
        );
      },
      update: async ({ where, data }: any) => {
        const item = memoryStore.find((t) => t.id === where.id);
        if (item) Object.assign(item, data);
        return item;
      },
    };
    (db as any).journeyProfile = {
      findUnique: async () => ({ currentPhase: "studying" }),
    };
    (db as any).journeyEvent = {
      create: async ({ data }: any) => {
        eventStore.push(data);
        return data;
      },
    };

    // 1. Initial save
    const saveResult = await saveOpportunity("student-persist-test", sampleOpportunity);
    expect(saveResult.ok).toBe(true);
    expect(saveResult.alreadySaved).toBe(false);
    expect(saveResult.savedId).toBeDefined();

    // Verify durable event logged in journey
    expect(eventStore.length).toBe(1);
    expect(eventStore[0].type).toBe("opportunity_saved");
    expect(eventStore[0].title).toContain(sampleOpportunity.title);

    // 2. Duplicate save detection
    const dupResult = await saveOpportunity("student-persist-test", sampleOpportunity);
    expect(dupResult.ok).toBe(true);
    expect(dupResult.alreadySaved).toBe(true);
    expect(dupResult.savedId).toBe(saveResult.savedId);

    // 3. Round-trip retrieval
    const retrieved = await listSavedOpportunities("student-persist-test");
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].id).toBe(saveResult.savedId);
    expect(retrieved[0].opportunityId).toBe(sampleOpportunity.canonicalId);
    expect(retrieved[0].title).toBe(sampleOpportunity.title);
    expect(retrieved[0].employer).toBe(sampleOpportunity.employer);
    expect(retrieved[0].contractType).toBe(sampleOpportunity.contractType);
    expect(retrieved[0].sourceUrl).toBe(sampleOpportunity.sourceUrl);
    expect(retrieved[0].status).toBe("saved");
    expect(retrieved[0].opportunity.canonicalId).toBe(sampleOpportunity.canonicalId);
  });
});
