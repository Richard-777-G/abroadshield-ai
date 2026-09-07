import { describe, expect, test } from "bun:test";
import { francePolicyRegistry } from "./france-registry";

describe("France versioned policy registry", () => {
  test("resolves the current VLS-TS policy by country, phase and topic", () => {
    const result = francePolicyRegistry.current("fr-vls-ts-validation-3-months", {
      asOf: "2026-09-07",
      country: "FR",
      jurisdiction: "FR",
      phase: "arrival",
      topic: "vls-ts-validation",
    });
    expect(result.status).toBe("VERIFIED");
    expect(result.rule?.id).toBe("fr-vls-ts-validation-3-months-v1");
  });

  test("does not resolve a France policy into another country", () => {
    const result = francePolicyRegistry.current("fr-vls-ts-validation-3-months", {
      asOf: "2026-09-07",
      country: "NL",
      jurisdiction: "NL",
      phase: "arrival",
      topic: "vls-ts-validation",
    });
    expect(result.status).toBe("REQUIRES_MANUAL_CHECK");
    expect(result.rule).toBeNull();
  });

  test("keeps the existing France policy calculators separate from evidence selection", () => {
    expect(francePolicyRegistry.versions("fr-student-work-964-hours")).toHaveLength(1);
    expect(francePolicyRegistry.versions("fr-student-work-964-hours")[0]?.source.authority).toContain("Service-Public");
  });
});
