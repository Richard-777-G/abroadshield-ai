import { describe, expect, test } from "bun:test";
import { buildRequirementSnapshot } from "./requirements";

describe("Requirement policy integration", () => {
  test("surfaces France VLS-TS policy provenance and effective-period uncertainty", () => {
    const snapshot = buildRequirementSnapshot({ destination: "France", currentPhase: "arrival" });
    const requirement = snapshot.requirements.find((item) => item.policyEvidence?.ruleId === "fr-vls-ts-validation-3-months");
    expect(requirement).toBeDefined();
    expect(requirement?.policyEvidence?.ruleVersionId).toBe("fr-vls-ts-validation-3-months-v1");
    expect(requirement?.policyEvidence?.status).toBe("VERIFIED");
    expect(requirement?.reason).toContain("configured destination journey checklist");
    expect(requirement?.policyEvidence?.authority).toContain("Service-Public");
  });

  test("does not attach France policy evidence to another destination", () => {
    const snapshot = buildRequirementSnapshot({ destination: "Netherlands", currentPhase: "arrival" });
    expect(snapshot.requirements.some((item) => item.policyEvidence)).toBe(false);
  });

  test("marks an unavailable policy version as needs_review", () => {
    const snapshot = buildRequirementSnapshot({ destination: "France", currentPhase: "arrival", asOf: "2020-01-01" });
    const requirement = snapshot.requirements.find((item) => item.policyEvidence?.ruleId === "fr-vls-ts-validation-3-months");
    expect(requirement?.status).toBe("needs_review");
  });

  test("rejects an invalid application date boundary", () => {
    expect(() => buildRequirementSnapshot({ destination: "France", currentPhase: "arrival", asOf: "not-a-date" })).toThrow("valid asOf date");
    expect(() => buildRequirementSnapshot({ destination: "France", currentPhase: "arrival", asOf: "2026-02-30" })).toThrow("valid asOf date");
  });
});
