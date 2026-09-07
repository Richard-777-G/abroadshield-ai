import type { Applicability, EvidenceVerificationState, PolicyRuleVersion, PolicySelection } from "./policy-versioning";
import {
  calculateFrenchWorkBudget,
  calculateVlsTsValidationDeadline,
  FRANCE_CVEC_RULE,
} from "./policies/france";
import { francePolicyRegistry } from "./policies/france-registry";
import type {
  StudentWorkBudgetInput,
  StudentWorkBudgetResult,
  VlsTsValidationInput,
  VlsTsValidationResult,
} from "./policies/france";

export type PolicyExecutionQuery = Applicability & { asOf: string };
export type FrancePolicyRuleId =
  | "fr-cvec-2026-2027"
  | "fr-vls-ts-validation-3-months"
  | "fr-student-work-964-hours";

export type FrancePolicyInputMap = {
  "fr-cvec-2026-2027": Parameters<typeof FRANCE_CVEC_RULE.calculate>[0];
  "fr-vls-ts-validation-3-months": VlsTsValidationInput;
  "fr-student-work-964-hours": StudentWorkBudgetInput;
};

export type FrancePolicyOutputMap = {
  "fr-cvec-2026-2027": ReturnType<typeof FRANCE_CVEC_RULE.calculate>;
  "fr-vls-ts-validation-3-months": VlsTsValidationResult;
  "fr-student-work-964-hours": StudentWorkBudgetResult;
};

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

export function executeFrancePolicy<K extends FrancePolicyRuleId>(
  ruleId: K,
  query: PolicyExecutionQuery,
  input: FrancePolicyInputMap[K],
): PolicyExecutionResult<FrancePolicyOutputMap[K]> {
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

  let result: FrancePolicyOutputMap[K];
  switch (ruleId) {
    case "fr-cvec-2026-2027":
      result = FRANCE_CVEC_RULE.calculate(input as FrancePolicyInputMap["fr-cvec-2026-2027"]) as FrancePolicyOutputMap[K];
      break;
    case "fr-vls-ts-validation-3-months":
      result = calculateVlsTsValidationDeadline(input as VlsTsValidationInput) as FrancePolicyOutputMap[K];
      break;
    case "fr-student-work-964-hours":
      result = calculateFrenchWorkBudget(input as StudentWorkBudgetInput) as FrancePolicyOutputMap[K];
      break;
  }

  return { selection, result, provenance: executionProvenance };
}
