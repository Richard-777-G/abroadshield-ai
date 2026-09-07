import { describe, expect, test } from "bun:test";
import { AGENT_CAPABILITIES, TOOL_REGISTRY } from "./tool-registry";
import { STAGE_POLICIES } from "./stage-orchestrator";
import { VALID_PHASES } from "./phase";

describe("AbroadShield architecture invariants", () => {
  test("has one canonical four-phase journey", () => {
    expect(VALID_PHASES).toEqual(["pre-departure", "arrival", "studying", "job-success"]);
    expect(Object.keys(STAGE_POLICIES)).toEqual([...VALID_PHASES]);
  });

  test("registry and stage orchestration are closed over the capability type", () => {
    expect(Object.keys(TOOL_REGISTRY)).toHaveLength(AGENT_CAPABILITIES.length);
    for (const capability of AGENT_CAPABILITIES) {
      expect(TOOL_REGISTRY[capability].capability).toBe(capability);
    }
    for (const phase of VALID_PHASES) {
      for (const capability of STAGE_POLICIES[phase].capabilities) {
        expect(AGENT_CAPABILITIES).toContain(capability);
      }
    }
  });

  test("consequential capabilities are explicitly approval-gated", () => {
    expect(TOOL_REGISTRY.draft_email.requiresApproval).toBe(true);
    expect(TOOL_REGISTRY.cvec_payment.requiresApproval).toBe(true);
    expect(TOOL_REGISTRY.job_search.requiresLiveData).toBe(true);
    expect(TOOL_REGISTRY.housing_search.requiresLiveData).toBe(true);
    expect(TOOL_REGISTRY.visa_check.requiresLiveData).toBe(true);
  });
});
