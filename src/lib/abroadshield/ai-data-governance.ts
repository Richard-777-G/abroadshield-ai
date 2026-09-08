import type { StudentContextSnapshot } from "./student-context";

export type AiPurpose =
  | "journey_assistance"
  | "opportunity_matching"
  | "document_assistance"
  | "application_preparation";

/** Fields allowed into a model prompt for each declared product purpose. */
const PURPOSE_FIELDS: Record<AiPurpose, ReadonlySet<string>> = {
  journey_assistance: new Set([
    "education.course",
    "education.university",
    "education.intake",
    "destination.country",
    "destination.city",
    "journey.phase",
    "journey.readiness",
    "career.goal",
  ]),
  opportunity_matching: new Set([
    "education.course",
    "education.university",
    "destination.country",
    "destination.city",
    "career.goal",
  ]),
  document_assistance: new Set([
    "education.course",
    "education.university",
    "destination.country",
    "destination.city",
  ]),
  application_preparation: new Set([
    "student.name",
    "education.course",
    "education.university",
    "destination.country",
    "destination.city",
    "career.goal",
  ]),
};

function pick(snapshot: StudentContextSnapshot, path: string): unknown {
  const [group, field] = path.split(".");
  if (!group || !field) return undefined;
  return (snapshot as unknown as Record<string, Record<string, unknown>>)[group]?.[field];
}

/**
 * Purpose-bound model context. This is intentionally not a generic serializer of the student record.
 * Sensitive operational fields such as email, funding, visa appointment and document counts are
 * excluded unless a future purpose is explicitly reviewed and added to the allowlist.
 */
export function buildPrivacySafeAiContext(snapshot: StudentContextSnapshot, purpose: AiPurpose): string {
  const allowed = PURPOSE_FIELDS[purpose];
  const lines: string[] = [`AI PURPOSE: ${purpose}`];
  for (const path of allowed) {
    const value = pick(snapshot, path);
    if (value === undefined || value === null || value === "") continue;
    lines.push(`${path.toUpperCase()}: ${String(value)}`);
  }
  return lines.join("\n");
}

export function isAiPurposeSupported(purpose: string): purpose is AiPurpose {
  return purpose in PURPOSE_FIELDS;
}
