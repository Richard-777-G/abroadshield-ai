import type { Applicability, EvidenceVerificationState, PolicyRuleVersion, PolicySelection } from "./policy-versioning";
import { francePolicyRegistry, FRANCE_POLICY_CALCULATORS } from "./policies/france-registry";

export type PolicyExecutionQuery = Applicability & { asOf: string };
export type FrancePolicyRuleId = keyof typeof FRANCE_POLICY_CALCULATORS;

export type PolicyExecutionResult<T> = {
  selection: PolicySelection;
  result: T | null;
  provenance: {
    ruleVersionId: string | null;
    sourceId: string | null;
    authority: string | null;
    canonicalUrl: string | null;
    extractedClaim: string | null;
    verificationStatus: EvidenceVerificationState;
  };
};

function provenance(selection: PolicySelection): PolicyExecutionResult<never>["provenance"] {
  const rule: PolicyRuleVersion | null = selection.rule;
  return {
    ruleVersionId: rule?.id ?? null,
    sourceId: rule?.source.id ?? null,
    authority: rule?.source.authority ?? null,
    canonicalUrl: rule?.source.canonicalUrl ?? null,
    extractedClaim: rule?.extraction.claim ?? null,
    verificationStatus: selection.status,
  };
}

export function executeFrancePolicy<TInput, TOutput>(
  ruleId: FrancePolicyRuleId,
  query: PolicyExecutionQuery,
  input: TInput,
): PolicyExecutionResult<TOutput> {
  const selection = francePolicyRegistry.current(ruleId, query);
  const executionProvenance = provenance(selection);

  if (selection.rule === null) return { selection, result: null, provenance: executionProvenance };
  if (selection.status !== "VERIFIED" && selection.status !== "PROVISIONALLY_VERIFIED") {
    return { selection, result: null, provenance: executionProvenance };
  }
  if (selection.rule.effectivePeriodStatus === "UNKNOWN") {
    const manualSelection: PolicySelection = {
      ...selection,
      status: "REQUIRES_MANUAL_CHECK",
      reason: "The policy's legal effective period has not been established.",
    };
    return {
      selection: manualSelection,
      result: null,
      provenance: { ...executionProvenance, verificationStatus: "REQUIRES_MANUAL_CHECK" },
    };
  }

  const calculator = FRANCE_POLICY_CALCULATORS[ruleId] as (value: TInput) => TOutput;
  return { selection, result: calculator(input), provenance: executionProvenance };
}
