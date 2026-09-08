# AbroadShield AI — Engineering Development Framework v1.0

**Status:** Active engineering baseline  
**Depends on:** `docs/PRODUCT_CONSTITUTION.md`  
**Purpose:** Turn the product constitution into a disciplined, testable engineering method and prevent feature-first / UI-first drift.

---

## 1. Engineering Objective

Build AbroadShield as an **agentic international-student co-pilot**, not as a dashboard with an attached chatbot.

Every engineering change must strengthen at least one of these system capabilities:

1. agent reasoning and orchestration
2. persistent student context
3. evidence and policy integrity
4. capability discovery/routing/execution
5. workflow state and persistence
6. safe external actions and approvals
7. useful intelligent-workspace UX
8. observability, testing, security, privacy, and deployment

A visually complete feature with no real execution path is not considered complete.

---

## 2. Canonical Runtime Flow

The target runtime pipeline is:

```text
Student Intent
    ↓
Context Retrieval
    ↓
Intent / Outcome Understanding
    ↓
Plan / Decision
    ↓
Capability Discovery
    ↓
Capability Validation
    ↓
Execution
    ↓
Validation / Evidence
    ↓
Result + Explanation
    ↓
Persistence
    ↓
Next Action / Observation
```

For consequential work:

```text
Proposed Action
    ↓
Evidence / Preconditions
    ↓
User Approval
    ↓
External Execution
    ↓
External Confirmation
    ↓
Audit / Outcome
```

The four journey phases are context for this flow, not hard navigation walls.

---

## 3. Architectural Boundaries

The preferred dependency direction is:

```text
Domain
  ↓
Application / Services
  ↓
Orchestration / Capability Execution
  ↓
View Models / DTOs
  ↓
UI
```

Cross-cutting infrastructure such as AI runtimes, connectors, persistence, telemetry, and external providers must enter through explicit application/capability boundaries.

### Prohibited drift

- UI directly consuming Prisma/domain-shaped objects for application behavior
- UI deciding policy or statutory facts
- LLM directly mutating authoritative domain state
- experimental MCP/AI tools bypassing validation
- duplicate registries describing the same capability without a defined source of truth
- fake UI actions without an execution path
- silently treating mock/demo data as production data

---

## 4. Current Architecture Baseline

The current repository already contains important foundations:

- Next.js/React application and server routes
- Prisma/PostgreSQL persistence
- four-phase journey model
- stage orchestration
- task execution
- policy registry/versioning and France policy execution
- evidence-oriented policy states
- capability registry
- capability router
- approval/execution history
- application-layer journey/dashboard queries
- view-model mapping
- automated architecture and capability tests

The current architecture therefore should be **evolved, not discarded**.

A current structural smell is that `tool-registry.ts` and `capability-registry.ts` both describe capability metadata while `capability-router.ts` bridges between them. Consolidation into one canonical capability contract is an explicit engineering target.

---

## 5. Engineering Workstreams

### W1 — Agent Runtime

Goal: move from message/regex-driven tool selection toward an explicit agent execution lifecycle.

Required concepts:

- intent/outcome
- context snapshot
- plan
- capability selection
- preconditions
- execution state
- result
- uncertainty
- approval request
- observation/follow-up

Do not introduce a framework merely for the name. A framework is justified only if it reduces orchestration complexity and improves state, persistence, testing, streaming, or recovery.

### W2 — Capability Platform

Evolve the registry from catalogue to executable platform:

```text
Capability Contract
    ↓
Discovery
    ↓
Policy / Permission Check
    ↓
Input Schema Validation
    ↓
Provider Adapter
    ↓
Execution
    ↓
Output Validation
    ↓
Evidence / Result Mapping
    ↓
Audit
```

Every capability must declare whether it is deterministic, live-data dependent, evidence-producing, approval-gated, domain-mutating, experimental, phase-limited, or country-limited.

### W3 — Student Context

Create a stable application-level context snapshot that the agent can consume without coupling itself to database schemas.

Context should progressively include:

- profile and education
- destination and journey state
- goals/preferences
- skills/experience
- documents
- tasks/deadlines
- evidence
- prior decisions/actions
- outcomes

Context remains editable by the student.

### W4 — Evidence + Policy

Maintain the high-trust path:

```text
Authoritative Source
 → Evidence
 → Extraction
 → Effective Period
 → Applicability
 → Policy Version
 → Deterministic Rule
 → Result
 → Agent Explanation
```

AI can assist extraction and interpretation but cannot become the authoritative statutory calculator.

### W5 — End-to-End Student Workflows

Prioritize complete workflows over isolated features.

Initial reference workflows:

- internship discovery → ranking → preparation → approval → supported application → tracking
- part-time job discovery → eligibility → CV tailoring → preparation → approval → supported application → tracking
- targeted CV generation → edit → persistence → downstream reuse
- France compliance/deadline workflows → evidence → deterministic result → task → tracking

### W6 — Intelligent Workspace

UI should expose the work the agent is doing:

- conversation
- context
- live results
- evidence
- task state
- proposed actions
- approvals
- outcomes

Avoid dashboard accumulation. A screen is justified by a user outcome or workflow requirement.

### W7 — Governance / Security / Privacy

Treat GDPR, data governance, AI governance, permissions, retention, deletion/export, auditability, third-party boundaries, and approval controls as architecture rather than documentation added at the end.

### W8 — Quality / Delivery

Every meaningful workflow should have:

- unit tests for deterministic logic
- integration tests for application boundaries
- execution-path tests for capabilities
- negative/error-state tests
- authorization tests
- evidence/provenance tests where relevant
- build/CI verification
- honest production status

---

## 6. 2026 Learning Path — What We Actually Use

The supplied 2026 learning roadmap is useful, but **not as a requirement to rewrite AbroadShield in Python**.

| Learning item | Relevance to AbroadShield | Engineering decision |
|---|---|---|
| Python → AI apps | High | Learn and use for specialized AI/data services where Python materially helps; do not replace the existing TypeScript application without reason. |
| RAG → AI chatbots | Very high | Use the concepts for evidence/document retrieval and grounded context. RAG must not become a substitute for authoritative policy/evidence modeling. |
| LangGraph → AI agents | High conceptually | Learn stateful graph/agent orchestration. Evaluate LangGraph JS/TS or another orchestration framework against our existing orchestrator before adding a dependency. |
| FastAPI → AI backends | Medium/high | Useful when specialized Python AI services are introduced. Not necessary for every current API because the main product already has a Next.js server/application layer. |
| Docker → deploy AI apps | High | Use for reproducible local services, workers, AI services, testing, and future deployment. Vercel/Next.js remains valid for the current web application. |

The key principle is:

> **Learn the engineering concept first; adopt the framework only when the project needs it.**

---

## 7. How the Learning Path Maps to the Architecture

### Python

Potential future boundary:

```text
AbroadShield Application
        ↓
AI / Data Service Contract
        ↓
Python Service
        ↓
Model / OCR / extraction / ranking / specialized processing
        ↓
Validated result
        ↓
Application layer
```

Python services must communicate through explicit contracts rather than becoming a second unstructured backend.

### RAG

Use RAG for grounded retrieval such as:

- user documents
- approved evidence collections
- university/program material
- policy/evidence context
- retrieved opportunity information

Do not store everything in a vector database and call that the student model. Structured state, evidence provenance, and deterministic policy remain first-class.

### LangGraph / graph orchestration

The useful lesson is stateful, explicit orchestration:

```text
Understand
   ↓
Plan
   ↓
Select capability
   ↓
Check preconditions
   ↓
Execute
   ↓
Validate
   ↓
Ask / Act
   ↓
Observe
```

The current `capability-router.ts` uses deterministic message-pattern detection. That is a useful early mechanism but is not the final agent architecture. The next engineering step should define an explicit agent state/plan contract before deciding whether a graph framework is necessary.

### FastAPI

Introduce only when Python services become real product dependencies. Keep the boundary narrow and typed/validated.

### Docker

Use Docker to make supporting services reproducible and isolated. Docker Compose is particularly useful when the development environment contains multiple services. Containerization should improve engineering consistency, not add operational complexity without a need.

---

## 8. Development Method

Every feature follows this sequence:

### Step 1 — Define outcome

What should the student actually be able to accomplish?

### Step 2 — Define state

What persistent state is required before, during, and after the workflow?

### Step 3 — Define capability

What capability performs the real work?

### Step 4 — Define evidence / policy

What facts need authoritative evidence or deterministic rules?

### Step 5 — Define permissions

What can happen automatically and what requires approval?

### Step 6 — Define execution contract

Input schema → provider → output schema → error states → persistence.

### Step 7 — Define UI

Only after the workflow exists should the UI surface it.

### Step 8 — Test the full path

Test success, missing context, invalid input, stale/conflicting evidence, unavailable provider, permission denial, approval denial, external failure, and persistence.

### Step 9 — Verify production behavior

Do not mark the capability complete until the deployed path behaves as intended.

---

## 9. Capability Completion Standard

A capability is **Production-ready** only when the required path is real:

```text
Intent
 → Context
 → Routing
 → Preconditions
 → Execution
 → Validation
 → Result
 → Persistence
 → Next action
```

Otherwise use one of:

- **Partially implemented**
- **Designed**
- **Blocked**
- **Planned**

The UI must reflect the actual state.

---

## 10. Immediate Engineering Sequence

The next engineering sequence is deliberately structural:

1. **Audit the current architecture against this framework.**
2. **Identify duplicate/overlapping responsibility boundaries.**
3. **Consolidate the capability contract and execution model.**
4. **Define the agent state/plan contract.**
5. **Build one genuinely end-to-end agent workflow.**
6. **Use that workflow to validate the orchestration architecture.**
7. **Expand capability coverage only after the execution spine is reliable.**
8. **Add Python/RAG/LangGraph/FastAPI/Docker only where they solve a demonstrated architectural need.**

The first reference workflow should be selected for maximum architectural value, not maximum visual impact.

---

## 11. Non-Negotiable Engineering Rules

- No fake functionality.
- No fabricated live data.
- No fabricated integrations.
- No LLM ownership of statutory truth.
- No experimental AI direct mutation of authoritative state.
- No UI bypass of application-layer contracts.
- No duplicate sources of truth without an explicit adapter boundary.
- No new framework solely because it is popular.
- No feature considered complete because the UI renders.
- No architectural rewrite without evidence that the existing boundary cannot support the product constitution.
- Every consequential action is approval-aware and auditable.
- Every production claim must be verifiable.

---

## 12. North Star

The engineering system exists to make this product statement true:

> **AbroadShield is an AI agent and co-pilot that actually works for international students — understanding their journey, remembering their context, researching what matters, preparing what they need, coordinating the services around them, and taking action with their approval.**

The architecture should make that outcome easier over time, not make the student learn our architecture.
