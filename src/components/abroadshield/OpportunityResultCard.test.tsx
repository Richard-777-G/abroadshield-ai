import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import OpportunityResultCard from "./OpportunityResultCard";
import type { Opportunity, OpportunityMatch } from "@/lib/abroadshield/opportunity-types";

describe("OpportunityResultCard Component DOM & UX Verification", () => {
  const sampleOpportunity: Opportunity = {
    canonicalId: "opp-paris-75001-ml",
    providerId: "france_travail",
    providerOpportunityId: "FT-75001",
    sourceType: "government",
    sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/75001",
    title: "Stage Data Scientist / Machine Learning",
    employer: "Sorbonne AI Lab",
    location: "Paris (75005)",
    contractType: "internship",
    hoursPerWeek: { min: 35, max: 35 },
    salary: { min: 1000, max: 1200, currency: "EUR", period: "month" },
    requiredSkills: ["Python", "Machine Learning", "PyTorch"],
    freshness: "fresh",
    applicationCapability: "L1",
    eligibility: "requires_work_authorization_check",
    retrievedAt: "2026-09-08T00:00:00.000Z",
    provenance: {
      provider: "France Travail",
      sourceUrl: "https://candidat.francetravail.fr/offres/recherche/detail/75001",
      retrievedAt: "2026-09-08T00:00:00.000Z",
    },
  };

  const sampleMatch: OpportunityMatch = {
    opportunityId: "opp-paris-75001-ml",
    fit: "high",
    reasons: ["location", "course relevance"],
    constraints: [
      {
        kind: "location",
        status: "strong",
        detail: "The opportunity location matches the student's destination context.",
      },
      {
        kind: "course",
        status: "strong",
        detail: "The opportunity text references the student's exact course.",
      },
      {
        kind: "work_authorization",
        status: "unknown",
        detail: "Work authorization requires verification against student visa rules (e.g. annual 964h limit).",
      },
    ],
  };

  test("renders all required trust, source, freshness, and match signals", () => {
    const html = renderToStaticMarkup(
      <OpportunityResultCard opportunity={sampleOpportunity} match={sampleMatch} />
    );

    // 1. Verified Source Badge (France Travail L1)
    expect(html).toContain("Verified Source: France Travail (L1)");

    // 2. Freshness Badge
    expect(html).toContain("Fresh (≤7d)");

    // 3. Match Fit Badge
    expect(html).toContain("High Fit");

    // 4. Role Title, Employer, Location, Contract
    expect(html).toContain("Stage Data Scientist / Machine Learning");
    expect(html).toContain("Sorbonne AI Lab");
    expect(html).toContain("Paris (75005)");
    expect(html).toContain("Internship");

    // 5. Match Reasons Chips
    expect(html).toContain("✓ location");
    expect(html).toContain("✓ course relevance");

    // 6. Deterministic Work Authorization Safety Notice
    // Must show 'Requires verification' and never claim 'Eligible under 964h rule'
    expect(html).toContain("Work Authorization:</strong> Requires verification (Subject to 964h annual limit)");
    expect(html).not.toContain("Eligible under 964h rule");

    // 7. Canonical Provider Link
    expect(html).toContain('href="https://candidat.francetravail.fr/offres/recherche/detail/75001"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Open verified listing");

    // 8. Save to Journey Action
    expect(html).toContain("Save to Journey");

    // 9. Prepare Application Action
    expect(html).toContain("Prepare application");

    // 10. HONESTY: Must NOT display a misleading auto-apply button
    expect(html).not.toContain(">Apply<");
    expect(html).not.toContain(">Auto-apply<");
    expect(html).not.toContain(">Submit Application<");
  });

  test("renders saved state correctly when initialSaved is true", () => {
    const html = renderToStaticMarkup(
      <OpportunityResultCard
        opportunity={sampleOpportunity}
        match={sampleMatch}
        initialSaved={true}
      />
    );

    expect(html).toContain("Saved in Journey");
  });
});
