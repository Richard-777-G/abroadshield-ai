import { describe, expect, test } from "bun:test";
import { executeFrancePolicy } from "./policy-execution";

describe("executeFrancePolicy", () => {
  test("executes a verified France work policy with registry provenance", () => {
    const result = executeFrancePolicy(
      "fr-student-work-964-hours",
      { asOf: "2026-09-07", country: "FR", jurisdiction: "FR", phase: "studying", topic: "student-work" },
      { annualLoggedHours: 800, calendarYear: 2026 },
    );

    expect(result.selection.status).toBe("VERIFIED");
    expect(result.result?.annualMaxHours).toBe(964);
    expect(result.result?.remainingHours).toBe(164);
    expect(result.provenance.ruleVersionId).toBe("fr-student-work-964-hours-v1");
    expect(result.provenance.sourceId).toBe("fr-service-public-student-work");
  });

  test("blocks VLS-TS execution when the legal effective period is unknown", () => {
    const result = executeFrancePolicy(
      "fr-vls-ts-validation-3-months",
      { asOf: "2026-09-07", country: "FR", jurisdiction: "FR", phase: "arrival", topic: "vls-ts-validation" },
      { entryDateIntoFrance: "2026-06-10", currentDate: "2026-09-07" },
    );

    expect(result.selection.status).toBe("REQUIRES_MANUAL_CHECK");
    expect(result.result).toBeNull();
    expect(result.provenance.verificationStatus).toBe("REQUIRES_MANUAL_CHECK");
  });

  test("does not execute a conditional CVEC rule without the matching academic year", () => {
    const result = executeFrancePolicy(
      "fr-cvec-2026-2027",
      { asOf: "2026-09-07", country: "FR", jurisdiction: "FR", phase: "pre-departure", topic: "cvec", conditions: { academicYear: "2025-2026" } },
      { academicYear: "2025-2026" },
    );

    expect(result.selection.status).toBe("REQUIRES_MANUAL_CHECK");
    expect(result.result).toBeNull();
  });

  test("does not execute a France policy outside its applicability scope", () => {
    const result = executeFrancePolicy(
      "fr-student-work-964-hours",
      { asOf: "2026-09-07", country: "NL", jurisdiction: "NL", phase: "studying", topic: "student-work" },
      { annualLoggedHours: 100, calendarYear: 2026 },
    );

    expect(result.selection.status).toBe("REQUIRES_MANUAL_CHECK");
    expect(result.result).toBeNull();
  });
});
