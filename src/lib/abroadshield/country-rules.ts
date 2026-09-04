import type { PhaseId } from "./phase";

export interface CountryRule {
  country: string;
  flag: string;
  embassyLinks: { label: string; url: string }[];
  checklist: { item: string; phase: PhaseId }[];
}

export const COUNTRY_RULES: readonly CountryRule[] = [
  {
    country: "United Kingdom", flag: "🇬🇧",
    embassyLinks: [
      { label: "UK Gov — Student Visa", url: "https://www.gov.uk/student-visa" },
      { label: "Graduate Route", url: "https://www.gov.uk/graduate-route" },
      { label: "BRP collection", url: "https://www.gov.uk/biometric-residence-permits" },
    ],
    checklist: [
      { item: "CAS letter from university", phase: "pre-departure" },
      { item: "IHS surcharge paid", phase: "pre-departure" },
      { item: "TB test (if applicable)", phase: "pre-departure" },
      { item: "Bank statement (28-day rule)", phase: "pre-departure" },
      { item: "Collect BRP within 10 days", phase: "arrival" },
      { item: "Register with GP surgery", phase: "arrival" },
    ],
  },
  {
    country: "United States", flag: "🇺🇸",
    embassyLinks: [
      { label: "US State Dept — F-1 Visa", url: "https://travel.state.gov/content/travel/en/us-visas/study/f-1.html" },
      { label: "ICE — OPT & STEM", url: "https://www.ice.gov/sevis/opt" },
      { label: "SEVIS", url: "https://www.ice.gov/sevis" },
    ],
    checklist: [
      { item: "I-20 form from university", phase: "pre-departure" },
      { item: "SEVIS I-901 fee paid", phase: "pre-departure" },
      { item: "DS-160 visa application", phase: "pre-departure" },
      { item: "Visa interview at US consulate", phase: "pre-departure" },
      { item: "SEVIS check-in within 30 days of arrival", phase: "arrival" },
      { item: "On-campus employment authorization", phase: "studying" },
    ],
  },
  {
    country: "Canada", flag: "🇨🇦",
    embassyLinks: [
      { label: "IRCC — Study Permit", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html" },
      { label: "PGWP", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation.html" },
      { label: "Service Canada — SIN", url: "https://www.canada.ca/en/employment-social-development/services/sin.html" },
    ],
    checklist: [
      { item: "LOA from DLI institution", phase: "pre-departure" },
      { item: "Proof of funds (GIC or bank)", phase: "pre-departure" },
      { item: "Medical exam (if required)", phase: "pre-departure" },
      { item: "Get SIN on arrival", phase: "arrival" },
      { item: "Apply for provincial health card", phase: "arrival" },
      { item: "Apply for PGWP before permit expiry", phase: "job-success" },
    ],
  },
  {
    country: "Australia", flag: "🇦🇺",
    embassyLinks: [
      { label: "Home Affairs — Subclass 500", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500" },
      { label: "485 Graduate Work", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485" },
      { label: "OSHC providers", url: "https://www.studyaustralia.gov.au/english/live-in-australia/health-insurance" },
    ],
    checklist: [
      { item: "CoE from institution", phase: "pre-departure" },
      { item: "OSHC purchased for visa duration", phase: "pre-departure" },
      { item: "GTE statement", phase: "pre-departure" },
      { item: "Apply for TFN on arrival", phase: "arrival" },
      { item: "Open student bank account", phase: "arrival" },
      { item: "Apply for 485 visa before course end", phase: "job-success" },
    ],
  },
  {
    country: "Germany", flag: "🇩🇪",
    embassyLinks: [
      { label: "German Missions — Student Visa", url: "https://www.auswaertiges-amt.de/en/visa-service/bulk-issuing-student-visas" },
      { label: "Make it in Germany", url: "https://www.make-it-in-germany.com/en/" },
      { label: "Anmeldung (Berlin)", url: "https://service.berlin.de/dienstleistung/120686/" },
    ],
    checklist: [
      { item: "University admission letter", phase: "pre-departure" },
      { item: "Blocked account (Sperrkonto) setup", phase: "pre-departure" },
      { item: "Health insurance (TK/AOK)", phase: "pre-departure" },
      { item: "Anmeldung within 14 days of arrival", phase: "arrival" },
      { item: "Residence permit at Ausländerbehörde", phase: "arrival" },
      { item: "Apply for 18-month job-search permit", phase: "job-success" },
    ],
  },
  {
    country: "Ireland", flag: "🇮🇪",
    embassyLinks: [
      { label: "INIS — Study in Ireland", url: "https://www.irishimmigration.ie/" },
      { label: "Stamp 2 registration", url: "https://www.irishimmigration.ie/our-services/registration/" },
      { label: "Education in Ireland", url: "https://www.educationinireland.com/" },
    ],
    checklist: [
      { item: "University offer letter", phase: "pre-departure" },
      { item: "Private medical insurance", phase: "pre-departure" },
      { item: "Proof of funds", phase: "pre-departure" },
      { item: "Register with INIS within 90 days", phase: "arrival" },
      { item: "Open bank account", phase: "arrival" },
      { item: "Apply for Third Level Graduate Scheme", phase: "job-success" },
    ],
  },
  {
    country: "Netherlands", flag: "🇳🇱",
    embassyLinks: [
      { label: "IND — Student Visa", url: "https://ind.nl/en/study" },
      { label: "Orientation Year (Zoekjaar)", url: "https://ind.nl/en/residence-permits/study/orientation-year-highly-educated-persons" },
      { label: "Study in NL", url: "https://www.studyinnl.org/" },
    ],
    checklist: [
      { item: "University admission", phase: "pre-departure" },
      { item: "MVV visa application", phase: "pre-departure" },
      { item: "TB test (if required)", phase: "pre-departure" },
      { item: "BRP registration within 5 days", phase: "arrival" },
      { item: "Get BSN number", phase: "arrival" },
      { item: "Apply for Orientation Year after graduation", phase: "job-success" },
    ],
  },
  {
    country: "France", flag: "🇫🇷",
    embassyLinks: [
      { label: "Campus France", url: "https://www.campusfrance.org/en" },
      { label: "France-Visas (official)", url: "https://france-visas.gouv.fr/" },
      { label: "OFII registration", url: "https://www.ofii.fr/" },
    ],
    checklist: [
      { item: "Campus France application", phase: "pre-departure" },
      { item: "VLS-TS visa via France-Visas", phase: "pre-departure" },
      { item: "Proof of accommodation / financials", phase: "pre-departure" },
      { item: "Validate VLS-TS online within 3 months", phase: "arrival" },
      { item: "Register with CPAM (Sécurité Sociale)", phase: "arrival" },
      { item: "Apply for APS permit before visa expiry", phase: "job-success" },
    ],
  },
  {
    country: "New Zealand", flag: "🇳🇿",
    embassyLinks: [
      { label: "INZ — Student Visa", url: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/study-visa" },
      { label: "Post-Study Work Visa", url: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/post-study-work-visa" },
      { label: "Study in NZ", url: "https://www.studyinnewzealand.govt.nz/" },
    ],
    checklist: [
      { item: "Offer of place from institution", phase: "pre-departure" },
      { item: "Health insurance purchased", phase: "pre-departure" },
      { item: "Proof of funds", phase: "pre-departure" },
      { item: "Apply for IRD number", phase: "arrival" },
      { item: "Open student bank account", phase: "arrival" },
      { item: "Apply for Post-Study Work Visa", phase: "job-success" },
    ],
  },
  {
    country: "Singapore", flag: "🇸🇬",
    embassyLinks: [
      { label: "ICA — Student Pass", url: "https://www.ica.gov.sg/reside/study-in-singapore/student-pass" },
      { label: "MOM — Employment Pass", url: "https://www.mom.gov.sg/passes-and-permits/employment-pass" },
      { label: "Study in Singapore", url: "https://www.educationsingapore.sg/" },
    ],
    checklist: [
      { item: "University offer letter", phase: "pre-departure" },
      { item: "SOLAR registration for STP", phase: "pre-departure" },
      { item: "Medical examination (if required)", phase: "pre-departure" },
      { item: "Collect Student Pass at ICA", phase: "arrival" },
      { item: "Open bank account with FIN", phase: "arrival" },
      { item: "Apply for LTVP from qualifying institution", phase: "job-success" },
    ],
  },
];

export const COUNTRY_RULE_MAP = Object.fromEntries(COUNTRY_RULES.map((country) => [country.country, country])) as Record<string, CountryRule>;
