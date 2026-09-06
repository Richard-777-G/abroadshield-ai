# AbroadShield AI — Product Vision & Operating Doctrine

## Product definition

**AbroadShield is a persistent journey operating system for international students: it maintains the student's state, grounds decisions in authoritative evidence, orchestrates the work required at each stage, and lets the student approve consequential actions.**

The frontier model is replaceable infrastructure. The durable product is the relationship between:

- **State** — identity, destination, institution, programme, phase, dates, constraints, documents, work/study conditions and history.
- **Evidence** — authoritative sources, retrieval time, applicability, rule version and what claim each source supports.
- **Workflow** — tasks, dependencies, deadlines, blockers, approvals and next actions.
- **Execution** — research, document preparation, drafting, connectors and other approved actions.
- **Outcomes** — completed milestones, compliance events, applications, interviews, offers and employment outcomes.

## North-star experience

A student should be able to say:

> **"Know where I am in my journey, tell me what matters now, prove why it matters, do the work I have authorised, and keep the journey state current."**

The core loop is:

**Understand → Decide → Prepare → Verify → Ask → Act → Observe → Adapt**

## Four-stage journey

1. **Pre-Departure** — admission, visa readiness, funding evidence, documents, travel and deadlines.
2. **Arrival** — immigration validation, registration, housing, banking, healthcare, university setup and first-month obligations.
3. **Studying** — academic continuity, housing/financial stability, permitted work, internships, renewals and changing requirements.
4. **Job Success** — job search, CV/application operations, networking, sponsorship/work authorisation constraints and transition to post-study work status.

The architecture remains four-stage and country-neutral. The launch experience is not.

## Launch wedge

**France is the first production corridor.** The next expansion order is **Finland → Germany → United Kingdom**.

France is a proving ground for the operating model, not a permanent architectural limitation. The first production depth should concentrate on a small set of high-value, high-consequence workflows rather than pretending to cover all French bureaucracy.

### France v1 operating surface

**Pre-Departure**
- CVEC readiness and certificate tracking.
- France-Visas / VLS-TS readiness.
- Document and funding readiness.
- University enrolment prerequisites.

**Arrival**
- VLS-TS validation countdown and evidence tracking.
- French health-insurance registration workflow.
- Housing / CAF eligibility guidance with current 2026 rules.
- Local setup tasks and deadline tracking.

**Studying**
- 964-hour annual employment guardrail, using deterministic calculations.
- Contract / internship preparation and deadline tracking.
- Current official guidance checks when rules may have changed.

**Job Success**
- Transition planning for the French "recherche d'emploi ou création d'entreprise" residence route where applicable.
- Eligibility-aware job search and application operations.
- Approval-gated external communication.

## Trust doctrine

AbroadShield must never manufacture certainty.

### Rule 1 — Deterministic rules are code

Legal thresholds, date arithmetic, counters, deadlines and eligibility predicates that can be expressed as rules must be calculated by deterministic software, not by the LLM.

### Rule 2 — Evidence is first-class product state

A consequential claim should carry, where applicable:

- source URL;
- issuing authority;
- retrieval timestamp;
- jurisdiction / location scope;
- effective date or version when available;
- claim or requirement supported;
- confidence / verification state.

### Rule 3 — Search failure is a visible state

When authoritative evidence is unavailable or conflicting, the system should return **unverified / requires manual check**. It must not silently fall back to model memory.

### Rule 4 — AI explains and prepares; it does not invent authority

LLMs can interpret structured outputs, translate administrative language, summarize evidence and draft communications. They cannot invent legal requirements, dates, fees, employers, listings, or completed actions.

### Rule 5 — Consequential actions require approval

Sending email, submitting an application, making an external booking, or otherwise acting on the student's behalf remains behind an explicit approval boundary.

## Privacy and compliance doctrine

Privacy is part of the architecture, not a marketing claim.

- Minimize personal data to what each feature actually needs.
- Separate data purposes rather than bundling unrelated consent.
- Prefer derived state over storing raw identity documents when raw documents are not required.
- Encrypt sensitive data and restrict access by purpose.
- Provide retention and deletion controls.
- Treat international transfers as a legal/security design problem; do not describe a product as "GDPR-safe" merely because data is redacted or stored in Europe.
- Determine EU AI Act obligations from the actual product use case and deployment context before shipping high-impact automated decision functionality.

## Product boundaries

AbroadShield is not:

- a generic ChatGPT-style study-abroad chatbot;
- a law firm or immigration representative;
- an autonomous agent that makes irreversible decisions for a student;
- a job board with disconnected applications;
- a database of copied government text.

## Product moat

The moat is not the model. It is the accumulated relationship between **state + evidence + workflow + permissions + integrations + outcomes**.

A better frontier model should therefore make AbroadShield more useful without changing the product's core identity.

## Operating principles for engineering

1. Keep PostgreSQL/Prisma server-authoritative for journey state.
2. Keep the four-stage orchestration model stable while country policies evolve independently.
3. Make country rules modular and source-anchored rather than embedding scattered constants in UI components.
4. Treat source freshness and applicability as data, not prose.
5. Keep private workspace interactions fast and calm; operational screens should prefer responsiveness over decorative animation.
6. Build the France corridor deeply before widening country coverage.
7. Do not merge legacy job-operation code that uses browser-local state as the source of truth.
8. Measure real outcomes: completed required steps, prevented missed deadlines, compliant work tracking, successful applications and eventual study-to-work progression.

## Product success test

A release is not successful because the chatbot produced more messages.

A release is successful when a real student can use AbroadShield to complete an important journey milestone with less uncertainty, fewer manual steps, and a traceable explanation of why each action was recommended.

## Build sequence

### Now
- Stabilise the current workspace.
- Make France rules authoritative, modular and auditable.
- Build the first evidence-backed France arrival workflows.
- Establish deterministic deadline and work-limit primitives.
- Add outcome-oriented instrumentation.

### Next
- Harden France studying and career operations.
- Add server-authoritative job preferences and applications.
- Add stronger source freshness / conflict handling.
- Run real-user pilots with international students.

### Expansion
- Finland, then Germany, then UK.
- Reuse the same orchestration, evidence, permission and state architecture; only country policy packs and workflows should change.
