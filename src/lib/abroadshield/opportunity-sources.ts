import type { OpportunitySourceType, ApplicationCapabilityLevel } from "./opportunity-types";

export type OpportunitySourceDefinition = {
  id: string;
  label: string;
  country: string;
  geography?: string[];
  sourceType: OpportunitySourceType;
  discovery: "api" | "feed" | "public_search" | "connector" | "deep_link" | "planned";
  applicationCapability: ApplicationCapabilityLevel;
  requiresLiveData: boolean;
  status: "planned" | "available_when_configured" | "active";
  canonicalUrl?: string;
  notes: string;
};

/**
 * Source catalogue only. A registry entry does not imply that AbroadShield can
 * currently retrieve or submit against the provider. Execution requires a real adapter.
 */
export const OPPORTUNITY_SOURCES: OpportunitySourceDefinition[] = [
  {
    id: "france-travail",
    label: "France Travail",
    country: "France",
    sourceType: "government",
    discovery: "api",
    applicationCapability: "L1",
    requiresLiveData: true,
    status: "planned",
    canonicalUrl: "https://www.francetravail.fr/",
    notes: "Priority official employment source; activate only after a documented provider adapter is implemented and verified.",
  },
  {
    id: "1jeune1solution",
    label: "1jeune1solution",
    country: "France",
    sourceType: "government",
    discovery: "public_search",
    applicationCapability: "L1",
    requiresLiveData: true,
    status: "planned",
    canonicalUrl: "https://www.1jeune1solution.gouv.fr/",
    notes: "Government youth opportunity ecosystem; retrieval and application capabilities require verification before activation.",
  },
  {
    id: "jobaviz-crous",
    label: "Jobaviz / CROUS",
    country: "France",
    geography: ["Paris", "Île-de-France"],
    sourceType: "student_platform",
    discovery: "public_search",
    applicationCapability: "L1",
    requiresLiveData: true,
    status: "planned",
    canonicalUrl: "https://www.jobaviz.fr/",
    notes: "Student-job source; exact retrieval/application capabilities must be verified before production use.",
  },
  {
    id: "studentjob-france",
    label: "StudentJob France",
    country: "France",
    sourceType: "student_platform",
    discovery: "public_search",
    applicationCapability: "L1",
    requiresLiveData: true,
    status: "planned",
    canonicalUrl: "https://www.studentjob.fr/",
    notes: "Student-oriented opportunity source; provider terms and execution capabilities require verification.",
  },
  {
    id: "university-career-services",
    label: "University career services",
    country: "France",
    sourceType: "university",
    discovery: "connector",
    applicationCapability: "L2",
    requiresLiveData: true,
    status: "planned",
    notes: "Institution-specific adapters will be added only for universities with supported access paths.",
  },
  {
    id: "recruitment-agencies",
    label: "Recruitment agencies",
    country: "France",
    geography: ["Paris", "Île-de-France"],
    sourceType: "recruitment_agency",
    discovery: "public_search",
    applicationCapability: "L1",
    requiresLiveData: true,
    status: "planned",
    notes: "Provider-specific adapters required. Agency existence alone does not imply application automation.",
  },
  {
    id: "employer-careers",
    label: "Employer career sites",
    country: "France",
    sourceType: "employer",
    discovery: "public_search",
    applicationCapability: "L1",
    requiresLiveData: true,
    status: "planned",
    notes: "Employer-specific application flows vary; use assisted application unless a supported connector exists.",
  },
  {
    id: "remote-opportunities",
    label: "Remote / online opportunities",
    country: "France",
    sourceType: "remote_platform",
    discovery: "public_search",
    applicationCapability: "L1",
    requiresLiveData: true,
    status: "planned",
    notes: "Remote availability does not establish immigration, tax, or employment eligibility.",
  },
];

export function getOpportunitySource(id: string) {
  return OPPORTUNITY_SOURCES.find((source) => source.id === id);
}
