import { describe, expect, test } from "bun:test";
import { validateOpportunityRecord } from "./opportunity-adapter";
import type { Opportunity } from "./opportunity-types";

const validOpportunity: Opportunity = {
  canonicalId: "test:123",
  providerId: "test-provider",
  providerOpportunityId: "123",
  sourceType: "job_board",
  sourceUrl: "https://example.com/jobs/123",
  title: "Data Analyst Intern",
  employer: "Example Labs",
  location: "Paris",
  contractType: "internship",
  retrievedAt: "2026-09-08T00:00:00.000Z",
  freshness: "fresh",
  applicationCapability: "L1",
  provenance: {
    provider: "test-provider",
    sourceUrl: "https://example.com/jobs/123",
    retrievedAt: "2026-09-08T00:00:00.000Z",
  },
};

describe("opportunity adapter validation", () => {
  test("accepts a provenance-bearing canonical opportunity", () => {
    expect(validateOpportunityRecord(validOpportunity)).toBe(true);
  });

  test("rejects an opportunity without a provider id", () => {
    expect(validateOpportunityRecord({ ...validOpportunity, providerId: "" })).toBe(false);
  });

  test("rejects an opportunity without a source URL", () => {
    expect(validateOpportunityRecord({ ...validOpportunity, sourceUrl: "" })).toBe(false);
  });

  test("rejects an opportunity without provenance", () => {
    const invalid = { ...validOpportunity, provenance: undefined } as unknown as Opportunity;
    expect(validateOpportunityRecord(invalid)).toBe(false);
  });

  test("rejects an opportunity without an employer or title", () => {
    expect(validateOpportunityRecord({ ...validOpportunity, employer: "" })).toBe(false);
    expect(validateOpportunityRecord({ ...validOpportunity, title: "" })).toBe(false);
  });
});
