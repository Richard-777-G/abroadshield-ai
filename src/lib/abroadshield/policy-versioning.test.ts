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

  test("does not select a rule outside its effective period", () => {
    const registry = new PolicyVersionRegistry();
    registry.register({ ...base, effectiveFrom: "2027-01-01" });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("REQUIRES_MANUAL_CHECK");
    expect(result.rule).toBeNull();
  });

  test("surfaces stale evidence instead of producing a verified result", () => {
    const registry = new PolicyVersionRegistry();
    registry.register({ ...base, verificationStatus: "STALE" });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("STALE");
    expect(result.rule).toBeNull();
  });

  test("surfaces conflicting evidence instead of choosing silently", () => {
    const registry = new PolicyVersionRegistry();
    registry.register({ ...base, verificationStatus: "CONFLICTING" });
    const result = registry.getCurrent("fr-test", "2026-09-07", { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "test" });
    expect(result.status).toBe("CONFLICTING");
    expect(result.rule).toBeNull();
  });
});
