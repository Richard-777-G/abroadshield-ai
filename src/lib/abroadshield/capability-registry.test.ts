import { describe, expect, test } from "bun:test";
import { CAPABILITY_REGISTRY, canCapabilityMutateDomain, getCapability, isCapabilityUsable, isExperimentalCapability } from "./capability-registry";
import { assertCapabilityExecutionAllowed, detectCapability, routeAgentCapability } from "./capability-router";

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

  test("routes statutory work checks through the trusted policy engine", () => {
    const route = routeAgentCapability("work_rule_check");
    expect(route.capabilityId).toBe("france_policy_engine");
    expect(route.definition.class).toBe("trusted_internal");
  });

  test("routes live job research through the verified external capability", () => {
    const route = routeAgentCapability("job_search");
    expect(route.capabilityId).toBe("live_web_search");
    expect(route.definition.requiresLiveData).toBe(true);
  });

  test("enforces capability phase restrictions", () => {
    expect(() => assertCapabilityExecutionAllowed("tailor_cv", { phase: "pre-departure", country: "FR" })).toThrow();
    expect(() => assertCapabilityExecutionAllowed("tailor_cv", { phase: "studying", country: "FR" })).not.toThrow();
  });

  test("retains existing intent detection", () => {
    expect(detectCapability("find me jobs in Paris")).toBe("job_search");
    expect(detectCapability("check my VLS-TS validation deadline")).toBe("vlsts_validation");
  });
});
