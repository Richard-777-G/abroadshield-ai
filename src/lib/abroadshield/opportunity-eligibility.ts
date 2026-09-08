import type { Opportunity, OpportunityEligibility } from "./opportunity-types";
import type { StudentContextSnapshot } from "./student-context";

export type OpportunityEligibilityInput = {
  student: StudentContextSnapshot;
  opportunity: Opportunity;
  asOf: string;
};

export type OpportunityEligibilityResult = {
  eligibility: OpportunityEligibility;
  reasons: string[];
  requiresManualReview: boolean;
  policyChecks: Array<{
    id: string;
    status: "pass" | "fail" | "unknown";
    detail: string;
  }>;
};

/**
 * Conservative eligibility boundary. This layer does not infer immigration
 * status from free text and never treats an unknown work-authorization state
 * as eligible. Legal truth remains owned by the deterministic policy/evidence
 * layer; this function only consumes structured facts already established by it.
 */
export function evaluateOpportunityEligibility(
  input: OpportunityEligibilityInput,
): OpportunityEligibilityResult {
  const checks: OpportunityEligibilityResult["policyChecks"] = [];
  const reasons: string[] = [];

  const country = input.student.destination.country?.trim().toLowerCase();
  if (country === "france" && input.opportunity.eligibility === "eligible") {
    checks.push({ id: "opportunity-eligibility", status: "pass", detail: "The opportunity record is explicitly marked eligible by the policy layer." });
    reasons.push("deterministic work-authorization check passed");
    return { eligibility: "eligible", reasons, requiresManualReview: false, policyChecks: checks };
  }

  if (input.opportunity.eligibility === "not_eligible") {
    checks.push({ id: "opportunity-eligibility", status: "fail", detail: "The deterministic policy layer marked this opportunity as not eligible." });
    return { eligibility: "not_eligible", reasons: ["deterministic policy check failed"], requiresManualReview: false, policyChecks: checks };
  }

  checks.push({ id: "work-authorization", status: "unknown", detail: "The structured student work-authorization state is not established for this opportunity." });
  return {
    eligibility: "requires_work_authorization_check",
    reasons: ["work authorization requires a deterministic policy check before eligibility can be confirmed"],
    requiresManualReview: true,
    policyChecks: checks,
  };
}
