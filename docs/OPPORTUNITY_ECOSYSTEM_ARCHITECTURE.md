# AbroadShield AI — Opportunity Ecosystem Architecture v1.0

**Status:** Engineering design baseline
**Purpose:** Define how AbroadShield can discover, analyze, prepare, and eventually execute student job/internship applications across official portals, job boards, student platforms, local agencies, employers, and online-work sources without fabricating opportunities or pretending universal application access.

## 1. Product requirement

A student should be able to say:

> Find me part-time jobs, internships, and jobs around Paris that fit my course, skills, schedule, language, work authorization, and preferences.

AbroadShield should not respond with a generic list of websites.

It should build a live opportunity set, normalize it, remove duplicates, determine student-specific fit and constraints, explain why opportunities rank highly, prepare application material, and support the strongest real application path available for each source.

The product target is:

```text
Student Context
  ↓
Opportunity Intent
  ↓
Source Discovery
  ↓
Live Retrieval
  ↓
Normalization
  ↓
Deduplication
  ↓
Eligibility / Constraint Checks
  ↓
Student-specific Matching
  ↓
Ranking + Explanation
  ↓
Save / Track
  ↓
Application Preparation
  ↓
Approval
  ↓
Supported Application Execution
  ↓
External Confirmation
  ↓
Outcome Tracking
```

A missing application integration must never be represented as successful application execution.

## 2. France-first opportunity coverage

The first production corridor is France, with Paris/Île-de-France as the first city-scale reference implementation.

The source ecosystem should be broader than one job board. Candidate source classes include:

- France Travail and its official ecosystem
- government youth employment services such as 1jeune1solution
- student-specific platforms such as StudentJob and Jobaviz/CROUS where accessible
- university/career-center sources
- employer career sites
- specialist job boards
- internship and apprenticeship platforms
- temporary staffing/recruitment agencies
- local recruitment agencies
- hospitality/retail/student-work platforms
- remote-work sources
- networking/community sources
- direct employer outreach opportunities

The registry must distinguish **verified source availability** from merely planned integrations.

## 3. Source acquisition strategy

There is no single universal job API. Therefore AbroadShield uses a source-adapter strategy.

### Tier A — official/partner API or feed

Preferred for production aggregation.

Examples include official government APIs, licensed feeds, partner feeds, employer APIs, or documented provider APIs.

Properties:

- structured data
- stable identifiers
- refresh timestamps
- explicit provider contract
- lower duplication risk
- stronger provenance

### Tier B — provider-supported public search

Use only where technically and contractually permitted.

The adapter retrieves publicly available opportunity information and preserves the canonical source URL and retrieval timestamp.

### Tier C — user-authorized connector

For providers requiring an authenticated account, AbroadShield may use a user-authorized connector when the provider supports it.

The connector must declare exactly what it can do: search, save, create profile, upload CV, submit application, read status, etc.

### Tier D — deep-link / assisted application

When no supported machine-execution path exists, AbroadShield should still provide substantial value:

1. find and analyze the opportunity;
2. prepare the CV/cover letter/application answers;
3. identify missing information;
4. show the exact application destination;
5. open the destination for the student;
6. optionally provide a guided application checklist;
7. track the application only when the student confirms submission or a supported connector provides confirmation.

This is a real product capability, not a failure state. The UI must label it accurately as assisted application rather than automatic submission.

## 4. Application execution levels

Every source/application route receives one explicit capability level:

### L0 — Discover only

AbroadShield can find and analyze the opportunity but cannot reliably open an application workflow beyond the source URL.

### L1 — Prepare + deep-link

AbroadShield prepares the application package and opens the correct external destination.

### L2 — Guided application

AbroadShield can guide the student through known application fields, but the student performs the final interaction.

### L3 — Connector-assisted application

A supported provider connector can populate or submit defined application data after validation and explicit approval.

### L4 — Verified end-to-end application

The provider confirms the application submission through a supported integration and returns an external application identifier or equivalent confirmation.

AbroadShield must never label L0-L3 as L4.

## 5. Local recruitment agencies

Local agencies are a first-class source category, not an afterthought.

For Paris this includes temporary staffing, hospitality, retail, administrative, technology, and specialist recruitment agencies.

An agency may expose:

- searchable vacancies;
- candidate registration;
- profile upload;
- CV submission;
- availability forms;
- recruiter contact channels;
- branch/location information;
- agency-specific candidate pools.

These are separate capabilities and must not be assumed from the existence of an agency website.

The source registry therefore stores provider capabilities independently from source identity.

Example:

```text
Manpower Paris
  discovery: supported
  structured retrieval: supported/verified when adapter exists
  candidate account: external
  CV upload: provider-specific
  application submission: provider-specific
  confirmation: provider-specific
```

The same model applies to Adecco, Randstad, local agencies, university career services, and future country-specific providers.

## 6. Opportunity canonical model

All providers map into one provider-neutral opportunity model:

```text
Opportunity
- canonicalId
- providerId
- providerOpportunityId
- sourceUrl
- title
- employer
- employerUrl
- sourceType
- location
- geographicArea
- distanceFromStudent
- remoteMode
- contractType
- employmentCategory
- hoursPerWeek
- schedule
- startDate
- endDate
- salary
- currency
- requiredEducation
- requiredExperience
- requiredSkills
- preferredSkills
- requiredLanguages
- applicationRequirements
- eligibilitySignals
- publishedAt
- expiresAt
- retrievedAt
- freshnessStatus
- rawSourceReference
- applicationCapability
- applicationUrl
- externalApplicationId
```

The model must retain provenance. AI-generated interpretation must not overwrite provider-supplied facts.

## 7. Student-specific matching

Matching must use the persistent student context rather than a generic keyword search.

Relevant signals include:

- course/program
- specialization
- skills
- experience
- target career
- preferred industries
- French/English/other language level
- current journey phase
- expected arrival date
- city and radius
- university schedule
- availability
- preferred hours
- contract preferences
- remote/hybrid preference
- salary expectations
- work authorization
- accumulated student work hours where relevant
- document/application readiness

Matching should produce explainable dimensions rather than one unexplained LLM score.

Example:

```text
Fit
  Course relevance: high
  Skills match: high
  Location: high
  Schedule compatibility: medium
  Language requirement: high
  Work authorization: verified/unknown
  Experience requirement: acceptable
  Application readiness: high
```

## 8. Legal/work-authorization gate

For a France student, work opportunities must be evaluated against the student's actual immigration/work context before being recommended as immediately actionable.

The current authoritative Service-Public guidance states that a student residence status generally permits salaried work up to 964 hours per year, with additional rules for work beyond that limit. The product must use the deterministic policy/evidence layer rather than an LLM to calculate or assert eligibility.

Work opportunities must therefore carry states such as:

- `eligible`
- `eligible_with_conditions`
- `requires_work_authorization_check`
- `insufficient_information`
- `not_eligible`
- `manual_review`

The opportunity matcher must not silently convert unknown immigration information into eligible.

## 9. Online/remote work

"Remote" is not automatically equivalent to "legally available to a student in France."

Online opportunities must be classified by employment form and location implications, including where relevant:

- French salaried employment
- foreign-employer employment
- freelance/independent activity
- platform/gig work
- internship
- apprenticeship
- project-based contract

The system must route immigration/tax/self-employment questions through authoritative policy sources and manual review when the applicable rule is not established.

## 10. Deduplication

The same vacancy can appear through multiple providers.

Deduplication should use a confidence-based identity model built from:

- employer identity
- normalized title
- location
- contract type
- start date
- source identifiers
- canonical application URL
- description similarity

The system should preserve all source provenance even after presenting one canonical opportunity to the student.

## 11. Freshness

Opportunity data is inherently time-sensitive.

Each result must carry retrieval and freshness metadata.

Recommended states:

- `fresh`
- `aging`
- `stale`
- `expired`
- `source_unavailable`
- `unverified`

An opportunity should not remain presented as current simply because it was persisted previously.

## 12. Agent behavior

When the student asks:

> Find me internships in Paris related to my course.

The agent should not merely call a generic web search.

It should:

1. retrieve the student's course, skills, university, arrival/intake timing, language, preferences and documents;
2. determine relevant internship constraints;
3. identify applicable source adapters;
4. retrieve current opportunities;
5. normalize and deduplicate;
6. apply deterministic eligibility checks where available;
7. rank using explainable matching;
8. present a compact shortlist with source, freshness, fit and application path;
9. offer to prepare applications for selected opportunities;
10. request approval before consequential outbound actions;
11. execute only through a supported application capability;
12. persist the opportunity and application outcome.

If a source cannot be executed through a connector, the agent should say so while still completing all useful preparation work.

## 13. No universal auto-apply promise

The product promise is **not**:

> "AbroadShield can automatically apply to every job on the internet."

That would be technically brittle, legally/contractually problematic for some providers, and dishonest without provider-specific support.

The product promise should be:

> "AbroadShield searches the relevant opportunity ecosystem, understands which opportunities fit you, prepares the work, and uses the strongest supported application path available for each opportunity."

As partnerships and provider connectors increase, the number of L3/L4 application routes increases without changing the product model.

## 14. Paris reference workflow

For a student living/studying in Paris:

```text
Paris
  ↓
Radius + transport constraints
  ↓
France Travail + government youth ecosystem
  ↓
Student job platforms
  ↓
University/career ecosystem
  ↓
General job boards
  ↓
Specialist internship platforms
  ↓
Recruitment agencies
  ↓
Employer career sites
  ↓
Remote/online opportunities
  ↓
Normalize + deduplicate
  ↓
Eligibility + student fit
  ↓
Rank
  ↓
Prepare
  ↓
Apply through highest supported level
  ↓
Track
```

The city is therefore not merely a text filter. It becomes part of the student's operational context: location, radius, commute, schedule, local agencies, local services and opportunity sources.

## 15. What must not be built

Do not build:

- a fake unified job database populated with invented jobs;
- an LLM that claims to search providers it did not actually access;
- a universal browser bot that submits applications without provider support and approval;
- a job board clone;
- a static list of links presented as an agent;
- an unexplained AI fit score treated as legal eligibility;
- stale opportunities presented as current;
- automatic applications without external confirmation.

## 16. Engineering sequence

The opportunity ecosystem should be implemented in this order:

1. canonical opportunity and application data contracts;
2. provider/source registry;
3. source adapter interface;
4. France/Paris reference adapters beginning with the strongest accessible sources;
5. normalization + deduplication;
6. deterministic work-eligibility integration;
7. student-context matching and explainable ranking;
8. opportunity persistence and tracking;
9. CV/application package preparation;
10. L1/L2 assisted application flow;
11. first real L3/L4 provider connector where contractually and technically possible;
12. expand provider coverage based on actual usage and reliability.

This keeps the architecture honest while still allowing the platform to become dramatically more capable over time.
