import { describe, expect, test } from "bun:test";
import { AGENT_CAPABILITIES, getTool, TOOL_REGISTRY } from "./tool-registry";
import { STAGE_POLICIES, isCapabilityAllowedInStage, isCapabilitySupportedForDestination } from "./stage-orchestrator";

describe("Capability contract", () => {
  test("every canonical capability has exactly one registry definition", () => {
    expect(Object.keys(TOOL_REGISTRY).sort()).toEqual([...AGENT_CAPABILITIES].sort());
    for (const capability of AGENT_CAPABILITIES) {
      expect(getTool(capability)?.capability).toBe(capability);
    }
  });

  test("stage policies only reference registered capabilities", () => {
    for (const policy of Object.values(STAGE_POLICIES)) {
      for (const capability of policy.capabilities) expect(getTool(capability)).toBeDefined();
    }
  });

  test("France-only capabilities cannot leak to another destination", () => {
    expect(isCapabilitySupportedForDestination("France", "cvec_payment")).toBe(true);
    expect(isCapabilitySupportedForDestination("Netherlands", "cvec_payment")).toBe(false);
    expect(isCapabilitySupportedForDestination("France", "vlsts_validation")).toBe(true);
    expect(isCapabilitySupportedForDestination("Germany", "vlsts_validation")).toBe(false);
    expect(isCapabilitySupportedForDestination("Germany", "job_search")).toBe(true);
  });

  test("stage allow-list is deterministic", () => {
    expect(isCapabilityAllowedInStage("pre-departure", "cvec_payment")).toBe(true);
    expect(isCapabilityAllowedInStage("arrival", "cvec_payment")).toBe(false);
    expect(isCapabilityAllowedInStage("studying", "work_rule_check")).toBe(true);
    expect(isCapabilityAllowedInStage("job-success", "work_rule_check")).toBe(false);
  });
});
