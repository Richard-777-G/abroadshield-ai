import type { PolicyPhase } from "./types/policy";

export type EvidenceVerificationState =
  | "VERIFIED"
  | "PROVISIONALLY_VERIFIED"
  | "STALE"
  | "CONFLICTING"
  | "UNVERIFIED"
  | "REQUIRES_MANUAL_CHECK";

export type Applicability = {
  country: string;
  jurisdiction: string;
  phase?: PolicyPhase;
  topic?: string;
  conditions?: Record<string, string | number | boolean>;
};

export type PolicySource = {
  id: string;
  authority: string;
  canonicalUrl: string;
};

export type PolicyExtraction = {
  id: string;
  sourceId: string;
  claim: string;
  extractedAt: string;
};

export type PolicyRuleVersion = {
  id: string;
  ruleId: string;
  version: number;
  source: PolicySource;
  extraction: PolicyExtraction;
  effectiveFrom: string;
  effectiveUntil?: string;
  applicability: Applicability;
  verificationStatus: EvidenceVerificationState;
  supersedes?: string;
  conflictsWith?: string[];
};

export type PolicySelection = {
  rule: PolicyRuleVersion | null;
  status: EvidenceVerificationState;
  reason?: string;
};

function dateOnly(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) ? time : null;
}

function isEffective(version: PolicyRuleVersion, asOf: string): boolean {
  const at = dateOnly(asOf);
  const from = dateOnly(version.effectiveFrom);
  const until = version.effectiveUntil ? dateOnly(version.effectiveUntil) : null;
  if (at === null || from === null || (version.effectiveUntil && until === null)) return false;
  return from <= at && (until === null || at <= until);
}

export function validatePolicyVersion(version: PolicyRuleVersion): void {
  if (!version.id || !version.ruleId || version.version < 1) throw new Error("Policy version identity is invalid.");
  if (dateOnly(version.effectiveFrom) === null) throw new Error("effectiveFrom must be a valid ISO calendar date.");
  if (version.effectiveUntil && dateOnly(version.effectiveUntil) === null) throw new Error("effectiveUntil must be a valid ISO calendar date.");
  if (version.effectiveUntil && version.effectiveUntil < version.effectiveFrom) throw new Error("effectiveUntil cannot precede effectiveFrom.");
  if (!version.source.authority || !version.source.canonicalUrl) throw new Error("A policy source authority and canonical URL are required.");
  if (!version.extraction.claim || version.extraction.sourceId !== version.source.id) throw new Error("Policy extraction must reference its source and contain a claim.");
  if (version.applicability.country.length !== 2) throw new Error("Applicability country must be an ISO-3166 alpha-2 code.");
}

export class PolicyVersionRegistry {
  private readonly versions = new Map<string, PolicyRuleVersion>();

  register(version: PolicyRuleVersion): void {
    validatePolicyVersion(version);
    if (this.versions.has(version.id)) throw new Error(`Policy version already registered: ${version.id}`);
    this.versions.set(version.id, version);
  }

  list(ruleId?: string): PolicyRuleVersion[] {
    return [...this.versions.values()]
      .filter((version) => !ruleId || version.ruleId === ruleId)
      .sort((a, b) => b.version - a.version || b.effectiveFrom.localeCompare(a.effectiveFrom));
  }

  getCurrent(ruleId: string, asOf: string, applicability: Applicability): PolicySelection {
    if (dateOnly(asOf) === null) return { rule: null, status: "REQUIRES_MANUAL_CHECK", reason: "A valid ISO calendar date is required for policy selection." };

    const candidates = this.list(ruleId).filter((version) =>
      isEffective(version, asOf) &&
      version.applicability.country === applicability.country &&
      version.applicability.jurisdiction === applicability.jurisdiction &&
      (!version.applicability.phase || version.applicability.phase === applicability.phase) &&
      (!version.applicability.topic || version.applicability.topic === applicability.topic),
    );

    if (candidates.length === 0) return { rule: null, status: "REQUIRES_MANUAL_CHECK", reason: "No applicable policy version is available for the requested date and scope." };

    const conflicting = candidates.filter((candidate) => candidate.verificationStatus === "CONFLICTING");
    if (conflicting.length > 0) return { rule: null, status: "CONFLICTING", reason: "Applicable policy evidence is explicitly marked as conflicting." };

    const usable = candidates.filter((candidate) => candidate.verificationStatus === "VERIFIED" || candidate.verificationStatus === "PROVISIONALLY_VERIFIED");
    if (usable.length === 0) {
      const status = candidates.some((candidate) => candidate.verificationStatus === "STALE") ? "STALE" : "REQUIRES_MANUAL_CHECK";
      return { rule: null, status, reason: "No verified or provisionally verified applicable policy version is available." };
    }

    const highestVersion = usable[0];
    if (highestVersion.verificationStatus !== "VERIFIED") return { rule: highestVersion, status: "PROVISIONALLY_VERIFIED" };
    return { rule: highestVersion, status: "VERIFIED" };
  }
}
