import { describe, expect, test } from "bun:test";
import { CAPABILITY_REGISTRY, canCapabilityMutateDomain, getCapability, isCapabilityUsable, isExperimentalCapability } from "./capability-registry";

describe("provider-neutral capability registry", () => {
  test("every capability has an explicit trust and execution contract", () => {
    for (const capability of Object.values(CAPABILITY_REGISTRY)) {
      expect(capability.id).toBeTruthy();
      expect(capability.provider).toBeTruthy();
      expect(capability.protocol).toBeTruthy();
      expect(capability.class).toBeTruthy();
      expect(capability.status).toBeTruthy();
    }
  });

  test("experimental MCP capabilities cannot mutate domain state", () => {
    for (const capability of Object.values(CAPABILITY_REGISTRY)) {
      if (capability.class === "experimental_ai") expect(capability.mutatesDomain).toBe(false);
    }
    expect(canCapabilityMutateDomain("mcp_hub_search")).toBe(false);
    expect(isExperimentalCapability("mcp_hub_search")).toBe(true);
  });

  test("phase availability is deterministic", () => {
    expect(isCapabilityUsable("mcp_cv_matching", "studying")).toBe(true);
    expect(isCapabilityUsable("mcp_cv_matching", "pre-departure")).toBe(false);
    expect(isCapabilityUsable("missing-capability", "studying")).toBe(false);
    expect(getCapability("france_policy_engine")?.class).toBe("trusted_internal");
  });
});
