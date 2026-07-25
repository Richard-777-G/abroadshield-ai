import type { LucideIcon } from "lucide-react";
import {
  Plane,
  Home,
  BookOpen,
  Briefcase,
  FileCheck2,
  CalendarClock,
  Mail,
  Search,
  FileText,
  ShieldCheck,
  Bell,
  PiggyBank,
  MapPin,
  KeyRound,
  Wifi,
  GraduationCap,
  Clock,
  Award,
  Users,
  Building2,
} from "lucide-react";

/* ----------------------------------------------------------------------------
 *  AbroadShield AI — domain data model
 *  Driven entirely by the four PDF briefs. Each phase is a real leg of the
 *  student journey, not a marketing tab. The agent *does* work at each.
 * -------------------------------------------------------------------------- */

export type PhaseId = "pre-departure" | "arrival" | "studying" | "job-success";

export interface Phase {
  id: PhaseId;
  index: number;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind-ish accent token name (matches --shield-* vars) */
  accent: "emerald" | "amber" | "violet" | "cyan";
  colorHex: string;
  glowHex: string;
  milestone: string;
  agenticActions: string[];
  tasks: PhaseTask[];
  stats: { label: string; value: string }[];
}

export interface PhaseTask {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  status: "done" | "active" | "queued" | "at-risk";
  /** days from "today" in the demo timeline; negative = past */
  due?: number;
  agentic?: boolean;
}

export const PHASES: Phase[] = [
  {
    id: "pre-departure",
    index: 0,
    name: "Pre-Departure",
    tagline: "Get the stamp. Don't get the rejection.",
    description:
      "Builds the visa checklist, checks documents for gaps before the appointment (not after a rejection), tracks every deadline, and drafts the emails and forms the application needs.",
    icon: Plane,
    accent: "emerald",
    colorHex: "#2dd4a7",
    glowHex: "#0fd4a7",
    milestone: "Visa granted · Documents verified",
    agenticActions: [
      "Builds a country-specific visa checklist automatically",
      "Gap-checks passport, financials & admission letters",
      "Tracks every deadline and nudges before it bites",
      "Drafts consulate emails and form fields for approval",
    ],
    tasks: [
      {
        id: "pd-1",
        title: "Passport validity check",
        detail: "Must be valid 6 months beyond intended stay. Photo flagged: low resolution — re-upload requested.",
        icon: FileCheck2,
        status: "done",
        due: -14,
        agentic: true,
      },
      {
        id: "pd-2",
        title: "Financial proof gap",
        detail: "Bank statement missing one transaction page. Agent detected and requested page 3 of 4.",
        icon: FileText,
        status: "active",
        due: 2,
        agentic: true,
      },
      {
        id: "pd-3",
        title: "Visa appointment booked",
        detail: "Slot secured for 28 Aug, 09:30 IST. Travel itinerary draft ready for review.",
        icon: CalendarClock,
        status: "done",
        due: -5,
        agentic: true,
      },
      {
        id: "pd-4",
        title: "Sponsorship letter — draft",
        detail: "Drafted for parent's approval. Awaiting your sign-off before it goes out.",
        icon: Mail,
        status: "queued",
        due: 5,
        agentic: true,
      },
      {
        id: "pd-5",
        title: "Forex & insurance shortlist",
        detail: "3 providers compared against today's rate. Agent shortlisted by total cost, not markup.",
        icon: Search,
        status: "at-risk",
        due: 9,
        agentic: true,
      },
    ],
    stats: [
      { label: "Documents verified", value: "11 / 13" },
      { label: "Days to appointment", value: "6" },
      { label: "Drafts awaiting you", value: "2" },
    ],
  },
  {
    id: "arrival",
    index: 1,
    name: "Arrival",
    tagline: "Land with a plan, not a panic.",
    description:
      "Searches housing and compares options against budget, drafts landlord and bank messages, and tracks local registration requirements and dates.",
    icon: Home,
    accent: "violet",
    colorHex: "#b794ff",
    glowHex: "#a06bff",
    milestone: "Housed · Banked · Registered",
    agenticActions: [
      "Compares housing options against your real budget",
      "Drafts landlord & letting-agent messages in your tone",
      "Opens the bank-account appointment chain",
      "Tracks police / FRRO registration windows by city",
    ],
    tasks: [
      {
        id: "ar-1",
        title: "SIM card secured",
        detail: "Pre-paid eSIM activated at landing. Number handed to your family & agent.",
        icon: Wifi,
        status: "done",
        due: -2,
        agentic: true,
      },
      {
        id: "ar-2",
        title: "Housing shortlist",
        detail: "5 listings matched against £650/mo budget, 35-min commute cap, bills included.",
        icon: Search,
        status: "active",
        due: 3,
        agentic: true,
      },
      {
        id: "ar-3",
        title: "Bank appointment",
        detail: "Drafted the appointment-request email; 2 branches compared by student-account perks.",
        icon: Building2,
        status: "queued",
        due: 4,
        agentic: true,
      },
      {
        id: "ar-4",
        title: "FRRO registration",
        detail: "Within 14 days of arrival — agent has pre-filled the form and booked the slot.",
        icon: KeyRound,
        status: "active",
        due: 11,
        agentic: true,
      },
      {
        id: "ar-5",
        title: "Landlord message — draft",
        detail: "Response to a viewing request, in your approved tone. Ready to send.",
        icon: Mail,
        status: "queued",
        due: 1,
        agentic: true,
      },
    ],
    stats: [
      { label: "Listings shortlisted", value: "5" },
      { label: "Registration window", value: "14 days" },
      { label: "Drafts ready", value: "3" },
    ],
  },
  {
    id: "studying",
    index: 2,
    name: "Studying & Part-Time",
    tagline: "Stay legal. Stay funded. Stay on track.",
    description:
      "Tracks spending against real remaining funds, checks part-time opportunities against legal work-hour limits, and manages academic deadlines.",
    icon: BookOpen,
    accent: "amber",
    colorHex: "#ffb454",
    glowHex: "#f59e0b",
    milestone: "On budget · Within work-hour cap · Coursework on time",
    agenticActions: [
      "Tracks every spend against your remaining runway",
      "Flags part-time jobs that breach the work-hour cap",
      "Sends a Wednesday reminder before coursework deadlines",
      "Converts costs home so family sees the real number",
    ],
    tasks: [
      {
        id: "st-1",
        title: "Weekly budget review",
        detail: "£412 spent this week of £520 budget. Agent flagged an extra £30 transit charge.",
        icon: PiggyBank,
        status: "active",
        due: 0,
        agentic: true,
      },
      {
        id: "st-2",
        title: "Part-time job scan",
        detail: "3 on-campus roles match your 20hr/wk cap. 1 off-campus role flagged: breaches Tier-4 rule.",
        icon: Briefcase,
        status: "active",
        due: 4,
        agentic: true,
      },
      {
        id: "st-3",
        title: "Coursework deadline",
        detail: "Dissertation outline due Fri. Agent blocked your calendar & drafted the supervisor email.",
        icon: GraduationCap,
        status: "queued",
        due: 3,
        agentic: true,
      },
      {
        id: "st-4",
        title: "Work-hour ledger",
        detail: "17.5 hrs logged this week of the 20 hr cap. You're legal. Don't pick up Friday's shift.",
        icon: Clock,
        status: "done",
        due: 0,
        agentic: true,
      },
    ],
    stats: [
      { label: "Weekly budget left", value: "£108" },
      { label: "Hours used / cap", value: "17.5 / 20" },
      { label: "Coursework due", value: "3" },
    ],
  },
  {
    id: "job-success",
    index: 3,
    name: "Job Success",
    tagline: "Beat the post-study visa clock.",
    description:
      "Scans job openings against visa timelines, tailors the CV and cover letter per role, preps you for each specific interview, and runs an always-on networking tracker.",
    icon: Briefcase,
    accent: "cyan",
    colorHex: "#5ad6e6",
    glowHex: "#22b8d4",
    milestone: "Sponsored offer · Before the visa runs out",
    agenticActions: [
      "Scans openings against your post-study visa runway",
      "Tailors CV + cover letter per role automatically",
      "Preps you with role-specific interview questions",
      "Runs an always-on networking & follow-up tracker",
    ],
    tasks: [
      {
        id: "js-1",
        title: "Visa runway tracker",
        detail: "94 days left on your post-study work window. Agent re-ranked shortlist by sponsorship likelihood.",
        icon: CalendarClock,
        status: "active",
        due: 0,
        agentic: true,
      },
      {
        id: "js-2",
        title: "CV tailored — 12 roles",
        detail: "12 tailored CVs generated this week. Each version highlights the keywords from that JD.",
        icon: FileText,
        status: "done",
        due: -1,
        agentic: true,
      },
      {
        id: "js-3",
        title: "Networking follow-ups",
        detail: "3 alumni replies pending > 5 days. Agent drafted polite nudges, ready to send.",
        icon: Users,
        status: "active",
        due: 1,
        agentic: true,
      },
      {
        id: "js-4",
        title: "Interview prep — Solutions Eng",
        detail: "Prep deck built from the JD, your CV, and public notes. Mock Q&A ready.",
        icon: Award,
        status: "queued",
        due: 6,
        agentic: true,
      },
    ],
    stats: [
      { label: "Visa runway", value: "94 days" },
      { label: "Applications live", value: "12" },
      { label: "Alumni contacted", value: "23" },
    ],
  },
];

/* ----------------------------------------------------------------------------
 *  Live agent activity feed — what the agent does without being asked
 * -------------------------------------------------------------------------- */

export interface AgentActivity {
  id: string;
  phase: PhaseId;
  kind: "nudge" | "draft" | "check" | "search" | "alert" | "submit";
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
}

export const AGENT_FEED: AgentActivity[] = [
  {
    id: "a1",
    phase: "pre-departure",
    kind: "alert",
    title: "Bank statement — missing page 3 of 4",
    detail: "Auto-detected during gap-check. Re-upload requested before your appointment.",
    time: "2 min ago",
    icon: FileText,
  },
  {
    id: "a2",
    phase: "pre-departure",
    kind: "draft",
    title: "Drafted sponsorship letter for parent",
    detail: "Awaiting your approval. One tap to send to the consulate inbox.",
    time: "9 min ago",
    icon: Mail,
  },
  {
    id: "a3",
    phase: "studying",
    kind: "nudge",
    title: "17.5 / 20 hours logged — skip Friday's shift",
    detail: "Picking up the extra shift would breach your Tier-4 work-hour cap.",
    time: "21 min ago",
    icon: Clock,
  },
  {
    id: "a4",
    phase: "job-success",
    kind: "search",
    title: "Re-ranked 12 openings by sponsorship likelihood",
    detail: "Visa runway: 94 days. Two roles with confirmed sponsorship moved to the top.",
    time: "44 min ago",
    icon: Search,
  },
  {
    id: "a5",
    phase: "arrival",
    kind: "draft",
    title: "Drafted landlord reply for the Maple St viewing",
    detail: "In your approved tone. Confirm to send.",
    time: "1 hr ago",
    icon: Mail,
  },
  {
    id: "a6",
    phase: "job-success",
    kind: "nudge",
    title: "3 alumni replies pending > 5 days",
    detail: "Polite follow-up drafts ready. Network window closes faster than you think.",
    time: "2 hr ago",
    icon: Users,
  },
  {
    id: "a7",
    phase: "pre-departure",
    kind: "check",
    title: "Passport photo — low resolution flagged",
    detail: "Re-capture suggested in daylight, plain background.",
    time: "3 hr ago",
    icon: ShieldCheck,
  },
  {
    id: "a8",
    phase: "studying",
    kind: "alert",
    title: "Spend this week exceeded budget by £30",
    detail: "Train ticket repeat-charge detected. Cancel subscription? Draft ready.",
    time: "4 hr ago",
    icon: PiggyBank,
  },
  {
    id: "a9",
    phase: "arrival",
    kind: "submit",
    title: "FRRO registration form pre-filled",
    detail: "Slot booked within the 14-day window. Documents queued for upload.",
    time: "5 hr ago",
    icon: KeyRound,
  },
  {
    id: "a10",
    phase: "job-success",
    kind: "draft",
    title: "Tailored CV — Solutions Engineer role",
    detail: "12 tailored CVs generated this week. This one surfaces your AWS work.",
    time: "6 hr ago",
    icon: FileText,
  },
];

/* ----------------------------------------------------------------------------
 *  The student — one continuous memory across all four phases
 * -------------------------------------------------------------------------- */

export const STUDENT = {
  name: "Aarav Mehta",
  origin: "Pune, India",
  destination: "Manchester, United Kingdom",
  course: "MSc Data Science",
  university: "University of Manchester",
  intake: "Sep 2026",
  homeLanguage: "Marathi",
  familyCurrency: "INR",
  journeyStart: "2026-06-12",
  currentPhase: "pre-departure" as PhaseId,
  readiness: 72,
  documentsTotal: 13,
  documentsVerified: 11,
  deadlinesTracked: 27,
  draftsReady: 5,
};

export interface MemoryItem {
  phase: PhaseId;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const MEMORY: MemoryItem[] = [
  { phase: "pre-departure", label: "Visa type", value: "Student — Tier 4 (General)", icon: FileCheck2 },
  { phase: "pre-departure", label: "Appointment", value: "28 Aug, 09:30 IST", icon: CalendarClock },
  { phase: "pre-departure", label: "Funding proof", value: "£28,500 — shown", icon: PiggyBank },
  { phase: "arrival", label: "Target postcode", value: "M14 (rusholme)", icon: MapPin },
  { phase: "arrival", label: "Housing budget", value: "£650 / month, bills incl.", icon: Home },
  { phase: "arrival", label: "Bank preference", value: "Student account, no fees", icon: Building2 },
  { phase: "studying", label: "Weekly cap", value: "20 hrs (Tier 4 rule)", icon: Clock },
  { phase: "studying", label: "Runway left", value: "8.4 months at current burn", icon: PiggyBank },
  { phase: "studying", label: "Next deadline", value: "Dissertation outline — Fri", icon: GraduationCap },
  { phase: "job-success", label: "Post-study window", value: "94 days remaining", icon: CalendarClock },
  { phase: "job-success", label: "Target roles", value: "Data Eng · ML · Analytics", icon: Briefcase },
  { phase: "job-success", label: "Alumni network", value: "23 contacted · 7 replied", icon: Users },
];

/* ----------------------------------------------------------------------------
 *  Document vault — the gap-checker's view
 * -------------------------------------------------------------------------- */

export interface VaultDoc {
  id: string;
  name: string;
  phase: PhaseId;
  status: "verified" | "issue" | "missing" | "pending";
  issue?: string;
  scannedAt?: string;
}

export const VAULT: VaultDoc[] = [
  { id: "d1", name: "Passport bio page", phase: "pre-departure", status: "verified", scannedAt: "12 Jun" },
  { id: "d2", name: "Passport photo", phase: "pre-departure", status: "issue", issue: "Low resolution — recapture in daylight", scannedAt: "12 Jun" },
  { id: "d3", name: "University CAS letter", phase: "pre-departure", status: "verified", scannedAt: "18 Jun" },
  { id: "d4", name: "Bank statement (4 pages)", phase: "pre-departure", status: "issue", issue: "Missing page 3 of 4", scannedAt: "20 Jun" },
  { id: "d5", name: "Sponsorship letter", phase: "pre-departure", status: "pending" },
  { id: "d6", name: "TB test certificate", phase: "pre-departure", status: "verified", scannedAt: "02 Jul" },
  { id: "d7", name: "Flight itinerary", phase: "pre-departure", status: "verified", scannedAt: "10 Jul" },
  { id: "d8", name: "University enrollment", phase: "arrival", status: "missing" },
  { id: "d9", name: "Tenancy agreement", phase: "arrival", status: "missing" },
  { id: "d10", name: "Bank statement (UK)", phase: "arrival", status: "missing" },
  { id: "d11", name: "FRRO / police reg.", phase: "arrival", status: "missing" },
  { id: "d12", name: "BRP collection slip", phase: "arrival", status: "missing" },
  { id: "d13", name: "Academic transcript", phase: "studying", status: "missing" },
];

/* ----------------------------------------------------------------------------
 *  Country rules — the proprietary milestone-template table
 * -------------------------------------------------------------------------- */

export interface CountryRule {
  country: string;
  flag: string;
  currency: string;
  studentVisa: string;
  workCap: string;
  postStudyWindow: string;
  registration: string;
  insurance: string;
  bankAccount: string;
  highlights: string[];
  /** official government / embassy links for visa + registration */
  embassyLinks: { label: string; url: string }[];
  /** official pre-departure checklist items */
  checklist: { item: string; phase: PhaseId }[];
  /** popular student cities */
  cities: string[];
  /** average tuition (international, postgrad) */
  avgTuition: string;
  /** average living cost per year */
  avgLivingCost: string;
  /** language of instruction */
  language: string;
}

export const COUNTRIES: CountryRule[] = [
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP (£)",
    studentVisa: "Student Visa (Tier 4 successor)",
    workCap: "20 hrs/week term-time · full-time holidays",
    postStudyWindow: "2 years (Graduate Route)",
    registration: "Police reg. if vignette notes it · BRP collection in 10 days",
    insurance: "IHS surcharge paid upfront · NHS access",
    bankAccount: "Student account · 2-week appointment lead",
    highlights: [
      "BRP must be collected within 10 days of arrival",
      "Switching to Graduate Route before visa expiry only",
      "Off-campus work capped even in holidays",
    ],
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
    cities: ["London", "Manchester", "Edinburgh", "Birmingham"],
    avgTuition: "£22,000–£35,000/yr",
    avgLivingCost: "£12,000–£15,000/yr",
    language: "English",
  },
  {
    country: "United States",
    flag: "🇺🇸",
    currency: "USD ($)",
    studentVisa: "F-1 Academic Student",
    workCap: "On-campus only in year 1 · 20 hrs/week",
    postStudyWindow: "12 months OPT · +24 months STEM",
    registration: "SEVIS check-in within 30 days · I-20 endorsed for travel",
    insurance: "University plan required · varies by state",
    bankAccount: "SSN optional · student checking w/ passport + I-20",
    highlights: [
      "OPT must be applied for before program end date",
      "STEM extension locks employer to E-Verify",
      "CPT requires enrolment for a full academic year",
    ],
    embassyLinks: [
      { label: "US State Dept — F-1 Visa", url: "https://travel.state.gov/content/travel/en/us-visas/study/f-1.html" },
      { label: "ICE — OPT & STEM", url: "https://www.ice.gov/sevis/opt" },
      { label: "SEVIS check-in", url: "https://www.ice.gov/sevis" },
    ],
    checklist: [
      { item: "I-20 form from university", phase: "pre-departure" },
      { item: "SEVIS I-901 fee paid", phase: "pre-departure" },
      { item: "DS-160 visa application", phase: "pre-departure" },
      { item: "Visa interview at US consulate", phase: "pre-departure" },
      { item: "SEVIS check-in within 30 days of arrival", phase: "arrival" },
      { item: "On-campus employment authorization", phase: "studying" },
    ],
    cities: ["Boston", "New York", "San Francisco", "Chicago"],
    avgTuition: "$25,000–$55,000/yr",
    avgLivingCost: "$15,000–$20,000/yr",
    language: "English",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    currency: "CAD ($)",
    studentVisa: "Study Permit",
    workCap: "24 hrs/week off-campus (2024 rule)",
    postStudyWindow: "Up to 3 years PGWP",
    registration: "Port-of-entry CoPR · Service Canada for SIN",
    insurance: "Provincial plan · 3-month wait in ON/BC",
    bankAccount: "SIN required · student package at Big-5 banks",
    highlights: [
      "PGWP length tied to program length",
      "Off-campus cap moved from 20 to 24 hrs in 2024",
      "Provincial health has a coverage wait period",
    ],
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
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary"],
    avgTuition: "CAD 20,000–40,000/yr",
    avgLivingCost: "CAD 12,000–18,000/yr",
    language: "English / French",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    currency: "AUD ($)",
    studentVisa: "Subclass 500",
    workCap: "48 hrs/fortnight (capped)",
    postStudyWindow: "2–4 yrs (485 visa, by region & qual.)",
    registration: "TFN for tax · NSW/Vic police check for some work",
    insurance: "OSHC mandatory for visa duration",
    bankAccount: "Student account · TFN avoids top tax rate",
    highlights: [
      "485 visa length depends on region & qualification",
      "OSHC must be active before arrival",
      "Work cap is per fortnight, not per week",
    ],
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
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth"],
    avgTuition: "AUD 22,000–45,000/yr",
    avgLivingCost: "AUD 20,000–27,000/yr",
    language: "English",
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    currency: "EUR (€)",
    studentVisa: "National Visa (Type D) → Residence Permit",
    workCap: "140 full-days or 280 half-days/yr",
    postStudyWindow: "18 months job-search residence",
    registration: "Anmeldung within 14 days · Ausländerbehörde for permit",
    insurance: "Public (TK/AOK) ~€120/mo · mandatory",
    bankAccount: "Blocked account required for visa",
    highlights: [
      "Anmeldung unlocks every other service",
      "Blocked account proves financials at visa stage",
      "18-month job search window starts at graduation",
    ],
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
    cities: ["Berlin", "Munich", "Frankfurt", "Hamburg"],
    avgTuition: "€0–€3,000/yr (public universities)",
    avgLivingCost: "€10,000–12,000/yr",
    language: "German / English",
  },
  {
    country: "Ireland",
    flag: "🇮🇪",
    currency: "EUR (€)",
    studentVisa: "Long Stay (D) Visa · Stamp 2",
    workCap: "20 hrs/week term-time · 40 hrs/week holidays",
    postStudyWindow: "Third Level Graduate Scheme (1–2 yrs)",
    registration: "GNIB/INIS registration within 90 days",
    insurance: "Private insurance mandatory for visa",
    bankAccount: "Student account · passport + college letter",
    highlights: [
      "Stamp 2 allows part-time work during studies",
      "Graduate scheme requires 1+ year study in Ireland",
      "Private health insurance needed before arrival",
    ],
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
    cities: ["Dublin", "Cork", "Galway", "Limerick"],
    avgTuition: "€10,000–25,000/yr",
    avgLivingCost: "€12,000–18,000/yr",
    language: "English",
  },
  {
    country: "Netherlands",
    flag: "🇳🇱",
    currency: "EUR (€)",
    studentVisa: "Entry Visa (MVV) + Residence Permit (VVR)",
    workCap: "No limit (EU students) · 16 hrs/wk non-EU",
    postStudyWindow: "1 year Orientation Year (Zoekjaar)",
    registration: "Municipality (BRP) within 5 days",
    insurance: "Health insurance mandatory (AON/AOK)",
    bankAccount: "BSN required to open account",
    highlights: [
      "BSN issued after BRP registration — unlocks everything",
      "Orientation year allows work without permit for 1 year",
      "Many English-taught programs",
    ],
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
    cities: ["Amsterdam", "Rotterdam", "Utrecht", "Eindhoven"],
    avgTuition: "€8,000–20,000/yr",
    avgLivingCost: "€10,000–15,000/yr",
    language: "English / Dutch",
  },
  {
    country: "France",
    flag: "🇫🇷",
    currency: "EUR (€)",
    studentVisa: "Visa Étudiant (Long Séjour) · VLS-TS",
    workCap: "964 hrs/year (≈ 20 hrs/week)",
    postStudyWindow: "APS — 1 year (renewable once)",
    registration: "OFII registration within 3 months",
    insurance: "Sécurité Sociale (free for students)",
    bankAccount: "Student account · proof of address required",
    highlights: [
      "VLS-TS must be validated online within 3 months",
      "Public universities charge very low fees",
      "Campus France is the official portal",
    ],
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
    cities: ["Paris", "Lyon", "Toulouse", "Lille"],
    avgTuition: "€3,000–18,000/yr (public/private)",
    avgLivingCost: "€10,000–14,000/yr",
    language: "French / English",
  },
  {
    country: "New Zealand",
    flag: "🇳🇿",
    currency: "NZD ($)",
    studentVisa: "Fee Paying Student Visa",
    workCap: "20 hrs/week term-time · full-time holidays",
    postStudyWindow: "Post-Study Work Visa (1–3 yrs)",
    registration: "IRD number for tax · bank account on arrival",
    insurance: "Health insurance mandatory",
    bankAccount: "IRD + passport + proof of address",
    highlights: [
      "Post-study work visa length depends on qualification level",
      "Pathway to skilled migrant category",
      "Work rights clearly defined on visa",
    ],
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
    cities: ["Auckland", "Wellington", "Christchurch", "Hamilton"],
    avgTuition: "NZD 22,000–40,000/yr",
    avgLivingCost: "NZD 20,000–25,000/yr",
    language: "English",
  },
  {
    country: "Singapore",
    flag: "🇸🇬",
    currency: "SGD ($)",
    studentVisa: "Student Pass (STP)",
    workCap: "16 hrs/week term-time · no limit holidays",
    postStudyWindow: "1 year LTVP for job search (qualifying unis)",
    registration: "STP issued at ICA · FIN number for all services",
    insurance: "University medical insurance usually included",
    bankAccount: "Student account · passport + student pass",
    highlights: [
      "Student Pass requires in-person collection at ICA",
      "LTVP allows 1 year of job search from qualifying institutions",
      "Global hub for finance, tech, and logistics jobs",
    ],
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
    cities: ["Singapore (city-state)"],
    avgTuition: "SGD 20,000–45,000/yr",
    avgLivingCost: "SGD 15,000–25,000/yr",
    language: "English",
  },
];


/* ----------------------------------------------------------------------------
 *  Pricing — direct-to-student, agentic actions gated in paid tier
 * -------------------------------------------------------------------------- */

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: { text: string; included: boolean; agentic?: boolean }[];
  cta: string;
  highlighted?: boolean;
}

export const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Shield Free",
    price: "₹0",
    cadence: "forever",
    tagline: "The checklist + nudges. Forever free for the students who need it most.",
    cta: "Start free",
    features: [
      { text: "Country-specific visa checklist", included: true },
      { text: "Deadline tracking + proactive nudges", included: true, agentic: true },
      { text: "Document vault (5 uploads)", included: true },
      { text: "Multi-language interface (Hindi, Marathi, Tamil, more)", included: true },
      { text: "Document gap-checking", included: false, agentic: true },
      { text: "Drafted emails & forms", included: false, agentic: true },
      { text: "Housing & job shortlisting", included: false, agentic: true },
    ],
  },
  {
    id: "shield",
    name: "Shield Pro",
    price: "₹499",
    cadence: "/ month",
    tagline: "The agent does the work. You approve, it sends.",
    cta: "Unlock the agent",
    highlighted: true,
    features: [
      { text: "Everything in Shield Free", included: true },
      { text: "Unlimited document vault + OCR gap-checking", included: true, agentic: true },
      { text: "Drafts emails, forms, landlord & bank messages", included: true, agentic: true },
      { text: "Housing shortlist vs your real budget", included: true, agentic: true },
      { text: "Spending tracker vs runway", included: true, agentic: true },
      { text: "Work-hour ledger (never breach the cap)", included: true, agentic: true },
      { text: "Networking tracker & follow-up drafts", included: true, agentic: true },
    ],
  },
  {
    id: "jobsuccess",
    name: "Job Success",
    price: "₹1,499",
    cadence: "/ month · Phase 4 only",
    tagline: "Highest willingness-to-pay moment. Win the sponsored offer before the clock runs out.",
    cta: "Go for the offer",
    features: [
      { text: "Everything in Shield Pro", included: true },
      { text: "Visa-runway tracker vs openings", included: true, agentic: true },
      { text: "Per-role CV & cover-letter tailoring", included: true, agentic: true },
      { text: "Role-specific interview prep decks", included: true, agentic: true },
      { text: "Alumni & HR outreach drafts", included: true, agentic: true },
      { text: "1:1 human review on sponsored-offer shortlist", included: true },
      { text: "Offer-letter red-flag check before you sign", included: true, agentic: true },
    ],
  },
];

/* ----------------------------------------------------------------------------
 *  Why AbroadShield beats Claude / ChatGPT directly
 * -------------------------------------------------------------------------- */

export interface Pillar {
  title: string;
  detail: string;
  icon: LucideIcon;
}

export const PILLARS: Pillar[] = [
  {
    title: "Persistent journey memory",
    detail:
      "Not 'memory' in general — memory organized around a real sequence (visa → flight → SIM → housing → bank → work-hour limits) for one specific country.",
    icon: ShieldCheck,
  },
  {
    title: "Proactive, not reactive",
    detail:
      "The product reaches out first, before a deadline, instead of waiting to be asked. General AI assistants are reactive by default.",
    icon: Bell,
  },
  {
    title: "Country-specific rules baked in",
    detail:
      "It already knows the checklist, the sequence, and the work-hour cap. The student never has to explain their situation from scratch.",
    icon: MapPin,
  },
  {
    title: "Agentic task execution",
    detail:
      "It drafts, searches, shortlists, and fills in — with your approval — rather than only explaining what to do. The strongest pillar.",
    icon: FileCheck2,
  },
];

/* ----------------------------------------------------------------------------
 *  Chat starter prompts — show off what the agent can actually do
 * -------------------------------------------------------------------------- */

export const CHAT_STARTERS: { label: string; prompt: string }[] = [
  {
    label: "Draft a consulate email",
    prompt:
      "Draft a polite email to the UK consulate requesting a reschedule of my 28 Aug appointment to 02 Sep due to a delayed document. Keep it formal and short.",
  },
  {
    label: "Check my work-hour cap",
    prompt:
      "I've worked 17.5 hours this week and have a Friday shift. On a UK Student visa, can I take that shift without breaching the 20-hour cap?",
  },
  {
    label: "Tailor my CV",
    prompt:
      "I'm applying for a Solutions Engineer role. Tailor my CV bullet points to emphasize AWS, data pipelines, and stakeholder communication.",
  },
  {
    label: "Draft a landlord reply",
    prompt:
      "Draft a reply to a landlord who listed a room near M14 Manchester. I want to confirm viewing availability this Saturday and ask if bills are included.",
  },
];

export const ACCENT_MAP: Record<
  Phase["accent"],
  { text: string; border: string; bg: string; glow: string; dot: string }
> = {
  emerald: {
    text: "text-[oklch(0.85_0.19_158)]",
    border: "border-[oklch(0.74_0.17_162/0.45)]",
    bg: "bg-[oklch(0.74_0.17_162/0.12)]",
    glow: "as-glow-emerald",
    dot: "bg-[oklch(0.74_0.17_162)]",
  },
  amber: {
    text: "text-[oklch(0.86_0.17_80)]",
    border: "border-[oklch(0.8_0.15_80/0.45)]",
    bg: "bg-[oklch(0.8_0.15_80/0.12)]",
    glow: "as-glow-amber",
    dot: "bg-[oklch(0.8_0.15_80)]",
  },
  violet: {
    text: "text-[oklch(0.78_0.16_300)]",
    border: "border-[oklch(0.64_0.16_300/0.45)]",
    bg: "bg-[oklch(0.64_0.16_300/0.12)]",
    glow: "as-glow-emerald",
    dot: "bg-[oklch(0.64_0.16_300)]",
  },
  cyan: {
    text: "text-[oklch(0.82_0.13_210)]",
    border: "border-[oklch(0.74_0.13_210/0.45)]",
    bg: "bg-[oklch(0.74_0.13_210/0.12)]",
    glow: "as-glow-emerald",
    dot: "bg-[oklch(0.74_0.13_210)]",
  },
};

/* ----------------------------------------------------------------------------
 *  Deadline timeline — the 27 tracked deadlines across all 4 phases.
 *  Each has a day offset from "today" (negative = past, positive = future),
 *  a severity, and which phase it belongs to. Plotted on an interactive rail.
 * -------------------------------------------------------------------------- */

export interface Deadline {
  id: string;
  phase: PhaseId;
  label: string;
  /** day offset from "today" in the demo timeline; negative = past */
  day: number;
  severity: "done" | "info" | "warning" | "critical";
  group?: string;
}

export const DEADLINES: Deadline[] = [
  // ---- Pre-Departure (past) ----
  { id: "dl-1", phase: "pre-departure", label: "CAS letter received", day: -42, severity: "done", group: "University" },
  { id: "dl-2", phase: "pre-departure", label: "TB test booked", day: -30, severity: "done", group: "Health" },
  { id: "dl-3", phase: "pre-departure", label: "TB test result", day: -23, severity: "done", group: "Health" },
  { id: "dl-4", phase: "pre-departure", label: "Bank statement issued", day: -14, severity: "info", group: "Finance" },
  { id: "dl-5", phase: "pre-departure", label: "Passport photo flagged", day: -12, severity: "warning", group: "Documents" },
  // ---- Pre-Departure (current/upcoming) ----
  { id: "dl-6", phase: "pre-departure", label: "Sponsorship letter approved", day: 2, severity: "warning", group: "Documents" },
  { id: "dl-7", phase: "pre-departure", label: "Forex transfer window opens", day: 4, severity: "info", group: "Finance" },
  { id: "dl-8", phase: "pre-departure", label: "Re-upload bank page 3", day: 4, severity: "critical", group: "Documents" },
  { id: "dl-9", phase: "pre-departure", label: "Visa appointment · 09:30 IST", day: 6, severity: "critical", group: "Visa" },
  { id: "dl-10", phase: "pre-departure", label: "Forex & insurance shortlist", day: 9, severity: "warning", group: "Finance" },
  { id: "dl-11", phase: "pre-departure", label: "Flight booking window", day: 14, severity: "info", group: "Travel" },
  // ---- Arrival ----
  { id: "dl-12", phase: "arrival", label: "Land in Manchester", day: 28, severity: "info", group: "Travel" },
  { id: "dl-13", phase: "arrival", label: "SIM / eSIM activation", day: 28, severity: "info", group: "Setup" },
  { id: "dl-14", phase: "arrival", label: "Bank appointment", day: 32, severity: "warning", group: "Finance" },
  { id: "dl-15", phase: "arrival", label: "Housing viewing", day: 31, severity: "info", group: "Housing" },
  { id: "dl-16", phase: "arrival", label: "FRRO registration (14-day window)", day: 42, severity: "critical", group: "Legal" },
  { id: "dl-17", phase: "arrival", label: "BRP collection (10-day window)", day: 38, severity: "critical", group: "Legal" },
  { id: "dl-18", phase: "arrival", label: "University enrollment", day: 35, severity: "warning", group: "University" },
  // ---- Studying & Part-Time ----
  { id: "dl-19", phase: "studying", label: "Induction week ends", day: 45, severity: "info", group: "University" },
  { id: "dl-20", phase: "studying", label: "Bank statement (UK) due", day: 48, severity: "warning", group: "Finance" },
  { id: "dl-21", phase: "studying", label: "Part-time role — apply", day: 52, severity: "info", group: "Work" },
  { id: "dl-22", phase: "studying", label: "Dissertation outline due", day: 56, severity: "critical", group: "Academic" },
  { id: "dl-23", phase: "studying", label: "Weekly budget review", day: 60, severity: "info", group: "Finance" },
  { id: "dl-24", phase: "studying", label: "Work-hour ledger check", day: 67, severity: "warning", group: "Work" },
  // ---- Job Success ----
  { id: "dl-25", phase: "job-success", label: "CV tailoring — batch 2", day: 180, severity: "info", group: "Career" },
  { id: "dl-26", phase: "job-success", label: "Alumni follow-up round", day: 195, severity: "warning", group: "Networking" },
  { id: "dl-27", phase: "job-success", label: "Post-study visa window closes", day: 365, severity: "critical", group: "Visa" },
];

export const SEVERITY_STYLE: Record<
  Deadline["severity"],
  { label: string; dot: string; ring: string; text: string }
> = {
  done: {
    label: "Completed",
    dot: "bg-[oklch(0.5_0.02_165)]",
    ring: "ring-[oklch(0.6_0.04_165/0.4)]",
    text: "text-[oklch(0.68_0.02_165)]",
  },
  info: {
    label: "Upcoming",
    dot: "bg-[oklch(0.74_0.17_162)]",
    ring: "ring-[oklch(0.74_0.17_162/0.5)]",
    text: "text-[oklch(0.85_0.19_158)]",
  },
  warning: {
    label: "Action needed",
    dot: "bg-[oklch(0.8_0.15_80)]",
    ring: "ring-[oklch(0.8_0.15_80/0.55)]",
    text: "text-[oklch(0.86_0.17_80)]",
  },
  critical: {
    label: "Critical",
    dot: "bg-[oklch(0.66_0.19_22)]",
    ring: "ring-[oklch(0.66_0.19_22/0.6)]",
    text: "text-[oklch(0.72_0.19_22)]",
  },
};

/* ----------------------------------------------------------------------------
 *  Multilingual UI strings — the "language they trust" promise.
 *  Only the hero + key CTAs are localized for the demo; the agent chat stays
 *  in English by default (the LLM can reply in any language on request).
 * -------------------------------------------------------------------------- */

export type LocaleId = "en" | "hi" | "mr" | "ta";

export interface Locale {
  id: LocaleId;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LOCALES: Locale[] = [
  { id: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { id: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { id: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
  { id: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳" },
];

export interface HeroStrings {
  eyebrow: string;
  titleOne: string;
  titleMemory: string;
  titleFour: string;
  titleFinish: string;
  subtitle: string;
  ctaExplore: string;
  ctaAgent: string;
  stat1V: string;
  stat1L: string;
  stat2V: string;
  stat2L: string;
  stat3V: string;
  stat3L: string;
  stat4V: string;
  stat4L: string;
}

export const HERO_STRINGS: Record<LocaleId, HeroStrings> = {
  en: {
    eyebrow: "AbroadShield AI · Agentic Student Companion",
    titleOne: "One AI.",
    titleMemory: "One memory.",
    titleFour: "Four phases,",
    titleFinish: "start to finish.",
    subtitle:
      "The one relationship every student going abroad can count on for the entire journey — not a tool used once and dropped, but a presence that grows more valuable the longer it stays with someone.",
    ctaExplore: "Explore the journey",
    ctaAgent: "Talk to the agent",
    stat1V: "4",
    stat1L: "Phases, end to end",
    stat2V: "27",
    stat2L: "Deadlines tracked",
    stat3V: "13",
    stat3L: "Docs gap-checked",
    stat4V: "1",
    stat4L: "Memory, never reset",
  },
  hi: {
    eyebrow: "AbroadShield AI · सक्रिय छात्र साथी",
    titleOne: "एक AI।",
    titleMemory: "एक स्मृति।",
    titleFour: "चार चरण,",
    titleFinish: "शुरू से अंत तक।",
    subtitle:
      "वह एकमात्र संबंध जिस पर विदेश जाने वाला हर छात्र पूरी यात्रा के लिए भरोसा कर सके — एक बार इस्तेमाल करके छोड़ दिया जाने वाला औज़ार नहीं, बल्कि एक उपस्थिति जो जितना लंबा रहती है उतनी ही अधिक मूल्यवान होती है।",
    ctaExplore: "यात्रा देखें",
    ctaAgent: "एजेंट से बात करें",
    stat1V: "4",
    stat1L: "चरण, शुरू से अंत",
    stat2V: "27",
    stat2L: "समय-सीमा ट्रैक की गई",
    stat3V: "13",
    stat3L: "दस्तावेज़ जाँचे गए",
    stat4V: "1",
    stat4L: "स्मृति, कभी रीसेट नहीं",
  },
  mr: {
    eyebrow: "AbroadShield AI · प्रतिभाशाली विद्यार्थी सोबती",
    titleOne: "एक AI.",
    titleMemory: "एक स्मृती.",
    titleFour: "चार टप्पे,",
    titleFinish: "सुरुवातीपासून शेवटपर्यंत.",
    subtitle:
      "परदेशात जाणाऱ्या प्रत्येक विद्यार्थ्यासाठी संपूर्ण प्रवासभर विसंबून असण्यासारखे एकच नाते — एकदा वापरून टाकायचे साधन नाही, तर जितका जास्त वेळ राहील तितकेच मौल्यवान होणारी उपस्थिती.",
    ctaExplore: "प्रवास पाहा",
    ctaAgent: "एजंटशी बोला",
    stat1V: "4",
    stat1L: "टप्पे, सुरुवात ते शेवट",
    stat2V: "27",
    stat2L: "मुदती ट्रॅक केल्या",
    stat3V: "13",
    stat3L: "कागदपत्रे तपासली",
    stat4V: "1",
    stat4L: "स्मृती, कधीच रीसेट नाही",
  },
  ta: {
    eyebrow: "AbroadShield AI · செயல்படும் மாணவர் துணை",
    titleOne: "ஒரு AI.",
    titleMemory: "ஒரு நினைவு.",
    titleFour: "நான்கு கட்டங்கள்,",
    titleFinish: "தொடக்கம் முதல் முடிவு வரை.",
    subtitle:
      "வெளிநாட்டிற்குச் செல்லும் ஒவ்வொரு மாணவரும் முழு பயணத்திற்கும் நம்பக்கூடிய ஒரே உறவு — ஒருமுறை பயன்படுத்தி கைவிடும் கருவி அல்ல, நீண்ட காலம் இருக்க இருக்க மதிப்புமிக்கதாகும் ஒரு இருப்பு.",
    ctaExplore: "பயணத்தைப் பார்",
    ctaAgent: "முகவரிடம் பேசு",
    stat1V: "4",
    stat1L: "கட்டங்கள், முதல் இறுதி",
    stat2V: "27",
    stat2L: "காலக்கெடு கண்காணிப்பு",
    stat3V: "13",
    stat3L: "ஆவணங்கள் சரிபார்ப்பு",
    stat4V: "1",
    stat4L: "நினைவு, ஒருபோதும் மீட்டமைப்பு இல்லை",
  },
};
