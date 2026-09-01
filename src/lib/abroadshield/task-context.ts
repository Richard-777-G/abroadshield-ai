export type AgentProfile = {
  name?: string;
  email?: string;
  origin?: string;
  destination?: string;
  course?: string;
  university?: string;
  intake?: string;
  currentPhase?: string;
  documentsTotal?: number;
  documentsVerified?: number;
  visaAppointment?: string;
  funding?: string;
  homeLanguage?: string;
};

export function buildAgentContext(profile: AgentProfile = {}) {
  const documents =
    typeof profile.documentsTotal === "number"
      ? `${profile.documentsVerified ?? 0} of ${profile.documentsTotal} verified`
      : "document status not provided";

  return [
    `STUDENT: ${profile.name || "Authenticated student"}${profile.email ? ` (${profile.email})` : ""}`,
    `ORIGIN: ${profile.origin || "Not provided"}`,
    `DESTINATION: ${profile.destination || "Not provided"}`,
    `COURSE: ${profile.course || "Not provided"}`,
    `UNIVERSITY: ${profile.university || "Not provided"}`,
    `INTAKE: ${profile.intake || "Not provided"}`,
    `CURRENT PHASE: ${profile.currentPhase || "Not provided"}`,
    `DOCUMENTS: ${documents}`,
    `VISA APPOINTMENT: ${profile.visaAppointment || "Not provided"}`,
    `FUNDING: ${profile.funding || "Not provided"}`,
    `HOME LANGUAGE: ${profile.homeLanguage || "Not provided"}`,
  ].join("\n");
}
