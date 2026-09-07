import { describe, expect, test } from "bun:test";
import { PolicyVersionRegistry, type PolicyRuleVersion } from "./policy-versioning";

const base: PolicyRuleVersion = {
  id: "fr-test-v1",
  ruleId: "fr-test",
  version: 1,
  source: { id: "sp", authority: "Service-Public", canonicalUrl: "https://www.service-public.fr/", retrievedAt: "2026-09-06T00:00:00.000Z" },
  extraction: { id: "extract-v1", sourceId: "sp", claim: "Test rule", extractedAt: "2026-09-06T00:00:00.000Z" },
  effectivePeriodStatus: "KNOWN",
  effectiveFrom: "2026-01-01",
  applicability: { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" },
  verificationStatus: "VERIFIED",
};

describe("PolicyVersionRegistry", () => {
  test("selects the current applicable verified version", () => {
    const registry = new PolicyVersionRegistry();
    registry.register(base);
    registry.register({ ...base, id: "fr-test-v2", version: 2, effectiveFrom: "2026-07-01", supersedes: "fr-test-v1", extraction: { ...base.extraction, id: "extract-v2" } });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("VERIFIED");
    expect(result.rule?.id).toBe("fr-test-v2");
  });

  test("requires an applicable condition instead of silently broadening a conditional rule", () => {
    const registry = new PolicyVersionRegistry();
    registry.register({ ...base, applicability: { ...base.applicability, conditions: { academicYear: "2026-2027" } } });
    const missing = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(missing.status).toBe("REQUIRES_MANUAL_CHECK");
    const matched = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test", conditions: { academicYear: "2026-2027" } });
    expect(matched.status).toBe("VERIFIED");
  });

  test("does not select a rule outside its effective period", () => {
    const registry = new PolicyVersionRegistry();
    registry.register({ ...base, effectiveFrom: "2027-01-01" });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("REQUIRES_MANUAL_CHECK");
    expect(result.rule).toBeNull();
  });

  test("allows a superseding verified version to replace an older conflicting version", () => {
    const registry = new PolicyVersionRegistry();
    registry.register({ ...base, verificationStatus: "CONFLICTING" });
    registry.register({ ...base, id: "fr-test-v2", version: 2, effectiveFrom: "2026-07-01", supersedes: "fr-test-v1", extraction: { ...base.extraction, id: "extract-v2" } });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("VERIFIED");
    expect(result.rule?.id).toBe("fr-test-v2");
  });

  test("does not silently choose a verified version when active evidence conflicts", () => {
    const registry = new PolicyVersionRegistry();
    registry.register(base);
    registry.register({ ...base, id: "fr-test-v2", version: 2, effectiveFrom: "2026-07-01", extraction: { ...base.extraction, id: "extract-v2" }, verificationStatus: "CONFLICTING" });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("CONFLICTING");
    expect(result.rule).toBeNull();
  });

  test("surfaces stale evidence instead of producing a verified result", () => {
    const registry = new PolicyVersionRegistry();
    registry.register({ ...base, verificationStatus: "STALE" });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("STALE");
    expect(result.rule).toBeNull();
  });

  test("surfaces unknown effective period explicitly", () => {
    const registry = new PolicyVersionRegistry();
    registry.register({ ...base, effectivePeriodStatus: "UNKNOWN", effectiveFrom: undefined });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("VERIFIED");
    expect(result.rule?.id).toBe("fr-test-v1");
    expect(result.reason).toContain("effective start date is not explicitly established");
  });

  test("surfaces country, jurisdiction, and applicability scope mismatches", () => {
    const registry = new PolicyVersionRegistry();
    registry.register(base);
    expect(registry.getCurrent("fr-test", "2026-09-07", { country: "NL", jurisdiction: "NL", phase: "arrival", topic: "test" }).status).toBe("REQUIRES_MANUAL_CHECK");
    expect(registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "EU", phase: "arrival", topic: "test" }).status).toBe("REQUIRES_MANUAL_CHECK");
    expect(registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "studying", topic: "test" }).status).toBe("REQUIRES_MANUAL_CHECK");
    expect(registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "other" }).status).toBe("REQUIRES_MANUAL_CHECK");
  });
});
