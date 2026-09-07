import type { PolicyPhase } from "./types/policy";

export type EvidenceVerificationState =
  | "VERIFIED"
  | "PROVISIONALLY_VERIFIED"
  | "STALE"
  | "CONFLICTING"
  | "UNVERIFIED"
  | "REQUIRES_MANUAL_CHECK";

export type EffectivePeriodStatus = "KNOWN" | "UNKNOWN";

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
  retrievedAt: string;
  sourceVersion?: string;
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
  effectivePeriodStatus: EffectivePeriodStatus;
  effectiveFrom?: string;
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
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date.getTime() : null;
}

function isEffective(version: PolicyRuleVersion, asOf: string): boolean {
  const at = dateOnly(asOf);
  if (at === null) return false;
  if (version.effectiveFrom && (dateOnly(version.effectiveFrom) ?? NaN) > at) return false;
  if (version.effectiveUntil && (dateOnly(version.effectiveUntil) ?? NaN) < at) return false;
  return true;
}

function conditionsMatch(rule: Applicability, requested: Applicability): boolean {
  if (!rule.conditions) return true;
  const requestedConditions = requested.conditions ?? {};
  return Object.entries(rule.conditions).every(([key, value]) => requestedConditions[key] === value);
}

function isUsable(version: PolicyRuleVersion): boolean {
  return version.verificationStatus === "VERIFIED" || version.verificationStatus === "PROVISIONALLY_VERIFIED";
}

export function validatePolicyVersion(version: PolicyRuleVersion): void {
  if (!version.id || !version.ruleId || version.version < 1) throw new Error("Policy version identity is invalid.");
  if (version.effectiveFrom && dateOnly(version.effectiveFrom) === null) throw new Error("effectiveFrom must be a valid ISO calendar date.");
  if (version.effectiveUntil && dateOnly(version.effectiveUntil) === null) throw new Error("effectiveUntil must be a valid ISO calendar date.");
  if (version.effectiveFrom && version.effectiveUntil && version.effectiveUntil < version.effectiveFrom) throw new Error("effectiveUntil cannot precede effectiveFrom.");
  if (!version.source.authority || !version.source.canonicalUrl || !version.source.retrievedAt) throw new Error("A policy source authority, canonical URL and retrieval timestamp are required.");
  if (version.extraction.sourceId !== version.source.id || !version.extraction.claim) throw new Error("Policy extraction must reference its source and contain a claim.");
  if (!/^[A-Z]{2}$/.test(version.applicability.country)) throw new Error("Applicability country must be an uppercase ISO-3166 alpha-2 code.");
  if (!version.applicability.jurisdiction) throw new Error("Applicability jurisdiction is required.");
  if (version.effectivePeriodStatus === "KNOWN" && !version.effectiveFrom) throw new Error("Known effective periods require effectiveFrom.");
  if (version.effectivePeriodStatus === "UNKNOWN" && version.effectiveUntil) throw new Error("An unknown effective period cannot define effectiveUntil.");
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
      .sort((a, b) => b.version - a.version || (b.effectiveFrom ?? "").localeCompare(a.effectiveFrom ?? ""));
  }

  getCurrent(ruleId: string, asOf: string, applicability: Applicability): PolicySelection {
    if (dateOnly(asOf) === null) return { rule: null, status: "REQUIRES_MANUAL_CHECK", reason: "A valid ISO calendar date is required for policy selection." };

    const candidates = this.list(ruleId).filter((version) =>
      isEffective(version, asOf) &&
      version.applicability.country === applicability.country &&
      version.applicability.jurisdiction === applicability.jurisdiction &&
      (!version.applicability.phase || version.applicability.phase === applicability.phase) &&
      (!version.applicability.topic || version.applicability.topic === applicability.topic) &&
      conditionsMatch(version.applicability, applicability),
    );

    if (candidates.length === 0) return { rule: null, status: "REQUIRES_MANUAL_CHECK", reason: "No applicable policy version is available for the requested date and scope." };

    const candidateIds = new Set(candidates.map((candidate) => candidate.id));
    const supersededIds = new Set<string>();
    for (const candidate of candidates) {
      if (candidate.supersedes && candidateIds.has(candidate.supersedes)) supersededIds.add(candidate.supersedes);
    }
    const activeCandidates = candidates.filter((candidate) => !supersededIds.has(candidate.id));

    const explicitConflict = activeCandidates.find((candidate) =>
      candidate.verificationStatus === "CONFLICTING" ||
      (candidate.conflictsWith ?? []).some((conflictId) => activeCandidates.some((other) => other.id === conflictId)),
    );
    if (explicitConflict) {
      return { rule: null, status: "CONFLICTING", reason: `Applicable policy evidence is explicitly conflicting at version ${explicitConflict.version}.` };
    }

    const usable = activeCandidates.filter(isUsable);
    if (usable.length === 0) {
      const status = activeCandidates.some((candidate) => candidate.verificationStatus === "STALE") ? "STALE" : "REQUIRES_MANUAL_CHECK";
      return { rule: null, status, reason: "No verified or provisionally verified applicable policy version is available." };
    }

    const highestVersion = usable[0];
    if (highestVersion.effectivePeriodStatus === "UNKNOWN") {
      return { rule: highestVersion, status: highestVersion.verificationStatus, reason: "The authoritative source is verified, but its legal effective start date is not explicitly established by the source." };
    }
    return highestVersion.verificationStatus === "VERIFIED"
      ? { rule: highestVersion, status: "VERIFIED" }
      : { rule: highestVersion, status: "PROVISIONALLY_VERIFIED", reason: "The evidence is usable provisionally and requires stronger verification before consequential reliance." };
  }
}
