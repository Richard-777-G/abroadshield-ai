export type VerificationState =
  | "VERIFIED"
  | "PROVISIONALLY_VERIFIED"
  | "STALE"
  | "CONFLICTING"
  | "UNVERIFIED"
  | "REQUIRES_MANUAL_CHECK";

export type PolicyPhase = "pre-departure" | "arrival" | "studying" | "job-success";

export interface StatutoryEvidence {
  sourceAuthority: string;
  sourceUrl: string;
  retrievedAt: string;
  effectiveDate: string;
  jurisdiction: string;
  applicablePhase: PolicyPhase;
  verificationState: VerificationState;
  country?: string;
  topic?: string;
  claim?: string;
  effectiveUntil?: string;
  sourceVersion?: string;
  supersedes?: string;
  conflictsWith?: string[];
}

export interface PolicyRule<TInput, TOutput> {
  id: string;
  title: string;
  evidence: StatutoryEvidence;
  calculate: (input: TInput) => TOutput;
}
