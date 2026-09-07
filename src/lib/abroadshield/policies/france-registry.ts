import { CountryPolicyRegistry } from "../policy-registry";
import { FRANCE_CVEC_RULE, calculateFrenchWorkBudget, calculateVlsTsValidationDeadline, FRANCE_OFFICIAL_SOURCES, getFrancePolicyEvidence } from "./france";
import type { PolicyRuleVersion } from "../policy-versioning";

const cvecEvidence = getFrancePolicyEvidence("fr-cvec-2026-2027");
const vlsEvidence = getFrancePolicyEvidence("fr-vls-ts-validation-3-months");
const workEvidence = getFrancePolicyEvidence("fr-student-work-964-hours");

const version = (input: Omit<PolicyRuleVersion, "version">): PolicyRuleVersion => ({ ...input, version: 1 });

export const FRANCE_POLICY_VERSIONS: PolicyRuleVersion[] = [
  version({
    id: "fr-cvec-2026-2027-v1",
    ruleId: FRANCE_CVEC_RULE.id,
    source: { id: "fr-cvec", authority: cvecEvidence.sourceAuthority, canonicalUrl: FRANCE_OFFICIAL_SOURCES.cvec, retrievedAt: cvecEvidence.retrievedAt },
    extraction: { id: "fr-cvec-2026-2027-extraction-v1", sourceId: "fr-cvec", claim: "CVEC 2026-2027 rule represented by the existing France policy adapter.", extractedAt: cvecEvidence.retrievedAt },
    effectivePeriodStatus: "KNOWN",
    effectiveFrom: cvecEvidence.effectiveDate,
    applicability: { country: "FR", jurisdiction: "FR", phase: "pre-departure", topic: "cvec", conditions: { academicYear: "2026-2027" } },
    verificationStatus: cvecEvidence.verificationState,
  }),
  version({
    id: "fr-vls-ts-validation-3-months-v1",
    ruleId: "fr-vls-ts-validation-3-months",
    source: { id: "fr-service-public-vls-ts", authority: vlsEvidence.sourceAuthority, canonicalUrl: vlsEvidence.sourceUrl, retrievedAt: vlsEvidence.retrievedAt },
    extraction: { id: "fr-vls-ts-validation-extraction-v1", sourceId: "fr-service-public-vls-ts", claim: "VLS-TS validation is required within 3 months after arrival; the source page also states a €50 validation tax.", extractedAt: vlsEvidence.retrievedAt },
    effectivePeriodStatus: "UNKNOWN",
    applicability: { country: "FR", jurisdiction: "FR", phase: "arrival", topic: "vls-ts-validation" },
    verificationStatus: vlsEvidence.verificationState,
  }),
  version({
    id: "fr-student-work-964-hours-v1",
    ruleId: "fr-student-work-964-hours",
    source: { id: "fr-service-public-student-work", authority: workEvidence.sourceAuthority, canonicalUrl: workEvidence.sourceUrl, retrievedAt: workEvidence.retrievedAt },
    extraction: { id: "fr-student-work-extraction-v1", sourceId: "fr-service-public-student-work", claim: "Student work annual-hour rule represented by the existing France policy adapter.", extractedAt: workEvidence.retrievedAt },
    effectivePeriodStatus: "KNOWN",
    effectiveFrom: workEvidence.effectiveDate,
    applicability: { country: "FR", jurisdiction: "FR", phase: "studying", topic: "student-work" },
    verificationStatus: workEvidence.verificationState,
  }),
];

export const francePolicyRegistry = new CountryPolicyRegistry();
for (const policyVersion of FRANCE_POLICY_VERSIONS) francePolicyRegistry.register(policyVersion);

export const FRANCE_POLICY_CALCULATORS = {
  [FRANCE_CVEC_RULE.id]: FRANCE_CVEC_RULE.calculate,
  "fr-vls-ts-validation-3-months": calculateVlsTsValidationDeadline,
  "fr-student-work-964-hours": calculateFrenchWorkBudget,
} as const;
