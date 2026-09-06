export type VerificationState = "VERIFIED" | "UNVERIFIED" | "REQUIRES_MANUAL_CHECK";

export type PolicyPhase = "pre-departure" | "arrival" | "studying" | "job-success";

export interface StatutoryEvidence {
  sourceAuthority: string;
  sourceUrl: string;
  retrievedAt: string;
  effectiveDate: string;
  jurisdiction: string;
  applicablePhase: PolicyPhase;
  verificationState: VerificationState;
}

export interface PolicyRule<TInput, TOutput> {
  id: string;
  title: string;
  evidence: StatutoryEvidence;
  calculate: (input: TInput) => TOutput;
}
