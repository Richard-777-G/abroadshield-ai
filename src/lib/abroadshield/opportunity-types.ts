export type OpportunitySourceType =
  | "government"
  | "student_platform"
  | "university"
  | "job_board"
  | "employer"
  | "recruitment_agency"
  | "specialist"
  | "remote_platform"
  | "community";

export type OpportunityContractType =
  | "part_time"
  | "full_time"
  | "internship"
  | "apprenticeship"
  | "temporary"
  | "freelance"
  | "project"
  | "unknown";

export type ApplicationCapabilityLevel = "L0" | "L1" | "L2" | "L3" | "L4";

export type OpportunityFreshness = "fresh" | "aging" | "stale" | "expired" | "source_unavailable" | "unverified";

export type OpportunityEligibility =
  | "eligible"
  | "eligible_with_conditions"
  | "requires_work_authorization_check"
  | "insufficient_information"
  | "not_eligible"
  | "manual_review";

export type Opportunity = {
  canonicalId: string;
  providerId: string;
  providerOpportunityId?: string;
  sourceType: OpportunitySourceType;
  sourceUrl: string;
  title: string;
  employer: string;
  employerUrl?: string;
  location?: string;
  geographicArea?: string;
  distanceFromStudentKm?: number;
  remoteMode?: "onsite" | "hybrid" | "remote" | "unknown";
  contractType: OpportunityContractType;
  hoursPerWeek?: { min?: number; max?: number };
  schedule?: string;
  startDate?: string;
  endDate?: string;
  salary?: { min?: number; max?: number; currency: string; period?: "hour" | "month" | "year" | "total" | "unknown" };
  requiredEducation?: string[];
  requiredExperience?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  requiredLanguages?: string[];
  applicationRequirements?: string[];
  publishedAt?: string;
  expiresAt?: string;
  retrievedAt: string;
  freshness: OpportunityFreshness;
  applicationCapability: ApplicationCapabilityLevel;
  applicationUrl?: string;
  externalApplicationId?: string;
  eligibility?: OpportunityEligibility;
  provenance: {
    provider: string;
    sourceUrl: string;
    retrievedAt: string;
  };
};

export type OpportunityMatch = {
  opportunityId: string;
  fit: "high" | "medium" | "low" | "unknown";
  reasons: string[];
  constraints: Array<{
    kind: "course" | "skills" | "location" | "schedule" | "language" | "experience" | "work_authorization" | "application_readiness";
    status: "strong" | "acceptable" | "weak" | "unknown";
    detail: string;
  }>;
};
