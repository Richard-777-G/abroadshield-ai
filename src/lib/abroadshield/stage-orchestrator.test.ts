import { describe, expect, test } from "bun:test";
import { VALID_PHASES } from "./phase";
import { STAGE_POLICIES, isCapabilityAllowedInStage, isCapabilitySupportedForDestination } from "./stage-orchestrator";
import { AGENT_CAPABILITIES, getTool } from "./tool-registry";

describe("stage orchestration contracts", () => {
  test("every canonical phase has one policy", () => {
    expect(Object.keys(STAGE_POLICIES).sort()).toEqual([...VALID_PHASES].sort());
  });

  test("every stage capability is registered", () => {
    for (const policy of Object.values(STAGE_POLICIES)) {
      for (const capability of policy.capabilities) {
        expect(AGENT_CAPABILITIES).toContain(capability);
        expect(getTool(capability)?.capability).toBe(capability);
      }
    }
  });

  test("France-only capabilities never become available to another destination", () => {
    for (const capability of ["cvec_payment", "vlsts_validation", "caf_housing_check", "ameli_registration", "work_rule_check"] as const) {
      expect(isCapabilitySupportedForDestination("France", capability)).toBe(true);
      expect(isCapabilitySupportedForDestination("Germany", capability)).toBe(false);
      expect(isCapabilitySupportedForDestination(" france ", capability)).toBe(true);
    }
  });

  test("stage gates are deterministic", () => {
    expect(isCapabilityAllowedInStage("pre-departure", "cvec_payment")).toBe(true);
    expect(isCapabilityAllowedInStage("studying", "cvec_payment")).toBe(false);
    expect(isCapabilityAllowedInStage("job-success", "tailor_cv")).toBe(true);
  });
});
