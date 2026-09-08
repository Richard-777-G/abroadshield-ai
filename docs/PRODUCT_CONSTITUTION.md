# AbroadShield AI — Product Constitution v1.0

**Status:** Product vision baseline
**Purpose:** Canonical product-direction reference for future engineering decisions.

> **AbroadShield is an AI agent and co-pilot that actually works for international students — understanding their journey, remembering their context, researching what matters, preparing the work, connecting to relevant services, and taking approved actions on their behalf.**

## 1. Product Identity

AbroadShield is not a dashboard with an AI assistant. It is an AI co-pilot for international students, with persistent student context and an underlying journey operating system.

The core loop is:

**Understand → Decide → Research → Plan → Prepare → Verify → Act → Track → Adapt**

The student should be able to state an outcome naturally. AbroadShield should understand the student's context, determine what matters, research current information when needed, identify dependencies and risks, create a prioritized plan, and perform authorized work where technically, legally, and contractually supported.

## 2. What AbroadShield Is Not

AbroadShield is not:

- a CRM
- a generic chatbot
- a static information directory
- a collection of disconnected SaaS modules
- a collection of decorative dashboards/cards
- a set of buttons that only simulate functionality
- an application that claims integrations or execution capabilities that do not actually exist

Complexity belongs in the system, not on the student.

## 3. Core Experience

The primary interaction should be conversation-first, followed by an operating layer underneath the application.

The target interface is an **intelligent workspace** rather than a traditional SaaS dashboard:

- conversation
- persistent context
- tasks and results
- evidence
- contextual panels
- actions
- approvals

The UI should be creative, simple, highly convenient, and purpose-driven. AbroadShield should learn from the usability of systems such as ChatGPT, Claude, Gemini, and Google Maps without simply cloning any of them.

## 4. Agent-First Product Model

The student asks for an outcome, not a module.

Example:

> “Find internships for my course in France.”

The system should determine:

1. intent
2. student context
3. relevant journey phase
4. constraints and dependencies
5. appropriate capabilities
6. live-information requirements
7. evidence requirements
8. ranking criteria
9. next action
10. whether an action requires approval

Navigation may remain available, but the agent should orchestrate work rather than forcing students through arbitrary module hierarchies.

## 5. Journey Phases

The four-phase journey remains foundational:

1. **Pre-Departure** — planning, admissions, visa, documents, finances, preparation, deadlines
2. **Arrival** — arrival tasks, validation, housing, registration, local setup
3. **Studying** — academic life, compliance, work, internships, networking, student life
4. **Job Success** — career transition, applications, networking, employment, relevant work-authorization considerations

Phases are context, not walls.

If a student in Pre-Departure asks about internships, the agent should not simply block the request because internships are associated with a later phase. It should understand whether the request can be researched or planned now, explain future-stage dependencies, and execute only what is currently valid and supported.

## 6. Persistent Student Context

Student context is a core product capability, not merely a profile page.

It should progressively contain relevant:

- identity/profile information
- education
- destination
- journey phase
- goals
- skills
- experience
- documents
- preferences
- tasks
- evidence
- decisions
- actions
- outcomes

Persistent context must remain editable by the student. Persistent does not mean immutable.

The system should avoid repeatedly asking for information it already has and should understand downstream implications of changes where possible.

## 7. Student 360° Scope

AbroadShield is intended to cover the student's broader international journey, including where materially relevant:

- education and admissions
- immigration and compliance
- documents
- finance and budgeting
- housing
- career
- internships
- part-time work
- jobs
- networking
- local services
- banking
- healthcare
- transport
- food/groceries
- events and community
- travel
- student opportunities
- deadlines and risks

360° does **not** mean building every service ourselves. It means becoming an intelligent coordination layer across the relevant ecosystem.

## 8. Ecosystem and Integrations

The long-term ecosystem strategy is:

**Easy connections → hard connections**

Capability levels may progress from:

1. authoritative information/deep link
2. guided interaction
3. API/connector integration
4. agent-accessible capability
5. end-to-end execution where legally, technically, and contractually supported

Connectors should have a simple user experience, with recognizable service icons, connection status, permissions, and capabilities rather than becoming a large administrative subsystem.

## 9. Capability Architecture

The capability registry must evolve from a catalogue into a real capability discovery, validation, routing, and execution layer.

Capabilities should have explicit metadata such as:

- identity
- provider
- protocol
- trust class
- input/output schemas
- evidence characteristics
- live-data requirement
- approval requirement
- mutation permission
- supported phases
- supported countries
- execution status

Trust classes:

### Trusted Internal

Deterministic internal systems and authoritative product logic.

### Verified External

Known APIs, connectors, official services, and other defined external integrations.

### Experimental AI

MCP, open-source, community, and other experimental AI capabilities. These must be isolated behind validation and application-layer boundaries and must not directly mutate authoritative domain state.

## 10. MCP and Open Source

MCP is infrastructure, not the product.

Open-source models, Hugging Face capabilities, MCP servers, and other external AI tools should be added when they provide useful capabilities and can be placed behind a strict provider-neutral capability layer.

External AI output is not automatically legal truth or authoritative domain state.

Architecture:

**MCP/API/Model → Adapter → Capability Contract → Validation → Application Layer → Domain/Evidence**

Do not add external tools merely because they are available.

## 11. AI vs Deterministic Systems

AI should handle tasks such as:

- intent understanding
- conversation
- summarization
- interpretation
- planning
- classification
- extraction
- matching
- drafting
- reasoning over validated information

Deterministic systems must own consequential facts and state such as:

- statutory thresholds
- dates and deadlines
- counters
- fees
- eligibility predicates
- policy applicability
- policy versions
- workflow state
- permissions
- approval state

The LLM must not invent, recalculate, or alter statutory requirements.

## 12. Evidence and Policy

For immigration, legal, regulatory, and other consequential domains, the core chain is:

**Source → Evidence → Policy extraction → Effective period → Applicability → Policy version → Deterministic rule → Result → Agent explanation**

Evidence is first-class state. Relevant verification states include:

- verified
- provisionally_verified
- stale
- conflicting
- unverified
- requires_manual_check

If authoritative sources conflict, AbroadShield must not guess, silently choose a source, or let the LLM decide statutory truth. It should detect the conflict, preserve provenance, expose uncertainty, and route to appropriate manual review.

## 13. GDPR, EU AI Regulation, and Data Governance

Privacy and AI governance are architectural requirements from the beginning.

The product should be designed for:

- data minimization
- purpose limitation
- user control
- access control
- retention controls
- deletion
- export
- auditability
- third-party boundaries
- connector permissions
- evidence provenance
- AI capability boundaries
- appropriate human oversight
- adaptation as applicable EU legal/regulatory requirements change

Specific legal classifications and obligations must be assessed against the actual product use cases and deployment context rather than assumed.

## 14. Agent Autonomy and Approval

The agent should have substantial autonomy for reversible or low-risk work such as:

- research
- summarization
- planning
- matching
- drafting
- document analysis
- organization
- low-risk internal preparation

Consequential actions require explicit student approval where appropriate, including:

- applications
- submissions
- payments
- emails/messages
- contractual commitments
- external account actions
- other irreversible or high-impact actions

Core principle:

> **The agent moves the work. The student keeps the decision.**

Every consequential execution should have an honest record of proposed action, rationale, evidence where relevant, approval, execution attempt, external result, and final outcome.

## 15. Example: Internship Workflow

“Find internships for my course in France” should ultimately support:

**Student Context → Live opportunity sources → Search → Deduplicate → Filter → Rank → Explain fit → Save → Prepare application → Approval → Apply where supported → Track outcome**

A list of generic job websites is not considered a complete internship capability.

## 16. Example: CV Workflow

“Make me a CV for part-time jobs in France” should ultimately support:

**Retrieve profile/documents → Extract skills and experience → Identify target role → Identify gaps → Generate targeted CV → Edit → Save structured version → Reuse downstream**

The same underlying capability should support CVs targeted to master's applications, internships, part-time jobs, graduate roles, research, and other student requirements.

## 17. Definition of Actually Working

A feature is not complete merely because:

- a button exists
- a page exists
- a component renders
- an API route exists
- an LLM generates text
- a mock result appears
- a connector card exists
- a capability registry entry exists

A capability is considered genuinely functional only when the required workflow works end-to-end:

**User intent → Agent understanding → Correct context → Capability selection → Actual execution → Validation → Result → UI presentation → Persistence → Next action**

Where applicable, this additionally includes:

**Evidence → Policy → Approval → External execution → External confirmation → Audit**

## 18. Honest Capability Status

Future product and engineering tracking should distinguish:

- **Production-ready** — actually works end-to-end
- **Partially implemented** — real components work but the workflow is incomplete
- **Designed** — architecture/UI exists but execution is not implemented
- **Blocked** — known dependency, integration, or technical blocker
- **Planned** — not implemented

The UI must not make designed or planned capabilities appear production-ready.

## 19. Architecture North Star

The target architecture is:

**Student → Agent/Co-pilot → Context + State → Agent Orchestrator → Capability Router → Internal/External/MCP Capabilities → Evidence/Policy → Application Layer → View Models/DTOs → UI → Approval/Execution → Outcome → Student Context**

Application boundaries should enforce:

**Domain → Application/Service → View Model/DTO → UI**

The UI must not depend directly on database-shaped domain objects or bypass application-layer orchestration.

## 20. France First, Country-Neutral Architecture

The architecture remains country-neutral while France is the first serious production corridor.

France-specific implementations may include:

- policy registry
- authoritative evidence sources
- government services
- university ecosystem
- housing ecosystem
- career ecosystem
- local services
- connectors/capabilities

France should serve as a reference implementation rather than forcing the architecture to become France-specific.

## 21. Product North Star

> **AbroadShield is an AI agent and co-pilot that actually works for international students — understanding their journey, remembering their context, researching what matters, preparing what they need, coordinating the services around them, and taking action with their approval.**

The product exists because international students currently have to stitch together many websites, apps, documents, deadlines, institutions, jobs, services, and decisions. AbroadShield should become the intelligent layer that simplifies that complexity without pretending to have capabilities it does not actually possess.

## 22. Engineering Decision Rule

Before building a feature, ask:

1. Does this make the agent more capable of doing real work?
2. Does it improve persistent student context?
3. Does it improve trustworthy evidence/policy handling?
4. Does it enable a useful capability or integration?
5. Does it reduce complexity for the student?
6. Does it support an actual end-to-end workflow?
7. Is the capability honestly represented as implemented, partial, designed, blocked, or planned?

If the answer is no, the feature should be questioned before implementation.

**This document is the canonical product-vision baseline for future AbroadShield engineering decisions.**
