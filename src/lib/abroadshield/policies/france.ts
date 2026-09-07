import type { PhaseId } from "../phase";
import type { StatutoryEvidence, PolicyRule } from "../types/policy";

export const FRANCE_OFFICIAL_SOURCES = {
  servicePublic: "https://www.service-public.fr/",
  anef: "https://administration-etrangers-en-france.interieur.gouv.fr/",
  ameli: "https://etudiant-etranger.ameli.fr/",
  cvec: "https://cvec.etudiant.gouv.fr/",
  caf: "https://www.caf.fr/",
} as const;

const verifiedEvidence = (input: Omit<StatutoryEvidence, "verificationState">): StatutoryEvidence => ({ ...input, verificationState: "VERIFIED" });

const FRANCE_CVEC_EVIDENCE = verifiedEvidence({
  sourceAuthority: "Ministère de l'Enseignement supérieur / CVEC",
  sourceUrl: FRANCE_OFFICIAL_SOURCES.cvec,
  retrievedAt: "2026-09-06T00:00:00.000Z",
  effectiveDate: "2026-09-01",
  jurisdiction: "FR",
  applicablePhase: "pre-departure",
});

export const FRANCE_CVEC_RULE: PolicyRule<{ academicYear: string }, { feeEuros: number | null; portalUrl: string; evidence: StatutoryEvidence; verificationState: StatutoryEvidence["verificationState"] }> = {
  id: "fr-cvec-2026-2027",
  title: "Contribution Vie Étudiante et de Campus (CVEC)",
  evidence: FRANCE_CVEC_EVIDENCE,
  calculate: ({ academicYear }) => academicYear === "2026-2027"
    ? { feeEuros: 105, portalUrl: FRANCE_OFFICIAL_SOURCES.cvec, evidence: FRANCE_CVEC_EVIDENCE, verificationState: "VERIFIED" }
    : { feeEuros: null, portalUrl: FRANCE_OFFICIAL_SOURCES.cvec, evidence: { ...FRANCE_CVEC_EVIDENCE, verificationState: "REQUIRES_MANUAL_CHECK" }, verificationState: "REQUIRES_MANUAL_CHECK" },
};

export type VlsTsValidationStatus = "ON_TRACK" | "WARNING_30_DAYS" | "CRITICAL_14_DAYS" | "DUE_TODAY" | "OVERDUE" | "REQUIRES_MANUAL_CHECK";
export interface VlsTsValidationInput { entryDateIntoFrance: string; currentDate: string; }
export interface VlsTsValidationResult { deadline: string | null; monthsWindow: number; daysRemaining: number | null; taxStampCostEuros: number | null; status: VlsTsValidationStatus; reason?: string; evidence: StatutoryEvidence; }

function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) return null;
  return { year, month, day };
}

function addCalendarMonths(date: { year: number; month: number; day: number }, months: number): { year: number; month: number; day: number } {
  const absoluteMonth = date.year * 12 + (date.month - 1) + months;
  const targetYear = Math.floor(absoluteMonth / 12);
  const targetMonth = (absoluteMonth % 12) + 1;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  return { year: targetYear, month: targetMonth, day: Math.min(date.day, lastDay) };
}

function toUtcMs(date: { year: number; month: number; day: number }): number { return Date.UTC(date.year, date.month - 1, date.day); }
function iso(date: { year: number; month: number; day: number }): string { return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`; }

const FRANCE_VLS_TS_EVIDENCE = verifiedEvidence({
  sourceAuthority: "Direction de l'information légale et administrative (Service-Public)",
  sourceUrl: "https://www.service-public.fr/particuliers/vosdroits/F2231",
  retrievedAt: "2026-09-06T00:00:00.000Z",
  effectiveDate: "2024-09-06",
  jurisdiction: "FR",
  applicablePhase: "arrival",
});

export const calculateVlsTsValidationDeadline = (input: VlsTsValidationInput): VlsTsValidationResult => {
  const entry = parseIsoDate(input.entryDateIntoFrance); const current = parseIsoDate(input.currentDate);
  if (!entry || !current) return { deadline: null, monthsWindow: 3, daysRemaining: null, taxStampCostEuros: null, status: "REQUIRES_MANUAL_CHECK", reason: "A valid ISO calendar date is required for both entry date and current date.", evidence: FRANCE_VLS_TS_EVIDENCE };
  const deadline = addCalendarMonths(entry, 3);
  const daysRemaining = Math.ceil((toUtcMs(deadline) - toUtcMs(current)) / 86_400_000);
  let status: VlsTsValidationStatus = "ON_TRACK";
  if (daysRemaining < 0) status = "OVERDUE";
  else if (daysRemaining === 0) status = "DUE_TODAY";
  else if (daysRemaining <= 14) status = "CRITICAL_14_DAYS";
  else if (daysRemaining <= 30) status = "WARNING_30_DAYS";
  return { deadline: iso(deadline), monthsWindow: 3, daysRemaining, taxStampCostEuros: 50, status, evidence: FRANCE_VLS_TS_EVIDENCE };
};

export type FrenchWorkComplianceState = "SAFE" | "WARNING_80_PERCENT" | "BREACH" | "REQUIRES_MANUAL_CHECK";
export interface StudentWorkBudgetInput { annualLoggedHours: number; calendarYear: number; }
export interface StudentWorkBudgetResult { annualMaxHours: number | null; remainingHours: number | null; percentageUsed: number | null; complianceState: FrenchWorkComplianceState; evidence: StatutoryEvidence; reason?: string; }

const FRANCE_WORK_EVIDENCE = verifiedEvidence({
  sourceAuthority: "Direction de l'information légale et administrative (Service-Public)",
  sourceUrl: "https://www.service-public.fr/particuliers/vosdroits/F2728",
  retrievedAt: "2026-09-06T00:00:00.000Z",
  effectiveDate: "2026-09-06",
  jurisdiction: "FR",
  applicablePhase: "studying",
});

export const calculateFrenchWorkBudget = (input: StudentWorkBudgetInput): StudentWorkBudgetResult => {
  if (!Number.isFinite(input.annualLoggedHours) || input.annualLoggedHours < 0 || !Number.isInteger(input.calendarYear) || input.calendarYear < 2000) return { annualMaxHours: null, remainingHours: null, percentageUsed: null, complianceState: "REQUIRES_MANUAL_CHECK", evidence: FRANCE_WORK_EVIDENCE, reason: "Logged hours must be a non-negative finite number and calendarYear must be valid." };
  const annualMaxHours = 964;
  const remainingHours = annualMaxHours - input.annualLoggedHours;
  const percentageUsed = Number(((input.annualLoggedHours / annualMaxHours) * 100).toFixed(1));
  const complianceState: FrenchWorkComplianceState = remainingHours < 0 ? "BREACH" : percentageUsed >= 80 ? "WARNING_80_PERCENT" : "SAFE";
  return { annualMaxHours, remainingHours: Math.max(0, Number(remainingHours.toFixed(2))), percentageUsed: Math.min(100, Math.max(0, percentageUsed)), complianceState, evidence: FRANCE_WORK_EVIDENCE };
};

export type FrancePolicyId = "fr-cvec-2026-2027" | "fr-vls-ts-validation-3-months" | "fr-student-work-964-hours";
export const FRANCE_POLICY_RULES = [
  FRANCE_CVEC_RULE,
  { id: "fr-vls-ts-validation-3-months", title: "VLS-TS validation within 3 months of arrival", evidence: FRANCE_VLS_TS_EVIDENCE, calculate: calculateVlsTsValidationDeadline },
  { id: "fr-student-work-964-hours", title: "Student work limit of 964 hours per year", evidence: FRANCE_WORK_EVIDENCE, calculate: calculateFrenchWorkBudget },
] as const;

export function getFrancePolicyEvidence(policyId: FrancePolicyId): StatutoryEvidence {
  const policy = FRANCE_POLICY_RULES.find((rule) => rule.id === policyId);
  if (!policy) throw new Error(`Unknown France policy: ${policyId}`);
  return policy.evidence;
}

export function getFrancePhaseForPolicy(policyId: FrancePolicyId): PhaseId {
  return policyId === "fr-cvec-2026-2027" ? "pre-departure" : policyId === "fr-vls-ts-validation-3-months" ? "arrival" : "studying";
}
