# AbroadShield AI Engineering Guardrails

## Source of truth

1. `main` repository code is the implementation source of truth.
2. The engineering handover and product briefs provide continuity and product intent.
3. Production deployment status is accepted only when confirmed by Vercel; a GitHub push alone is not a deployment confirmation.

## Change protocol

Before changing code:

- Inspect the current `main` implementation and the exact file SHA.
- Identify the owning layer: domain, policy, application/service, API adapter, view model, or UI.
- Make the smallest coherent change that strengthens the boundary.
- Do not rewrite large UI files when the complete current source has not been inspected.
- Do not infer missing behavior from filenames, old commits, screenshots, or memory.

After changing code:

- Re-read the changed files from `main`.
- Confirm the branch head and commit chain.
- Use Vercel as the deployment authority when available.
- If build/test/deployment access is unavailable, report that limitation explicitly rather than assuming success.

## Architecture boundary

The intended dependency direction is:

`Database / external systems → domain & policy → application services / queries → view models → UI`

API routes are adapters. They should handle transport concerns and authentication context, then delegate application behavior.

UI components should consume view models and client adapters rather than Prisma/domain records.

## Truthfulness and safety

- Never invent statutory values, dates, eligibility rules, source authority, deployment status, test results, integrations, or user data.
- Deterministic policy code owns statutory calculations and predicates.
- Evidence status must remain explicit when a rule is stale, conflicting, unverified, or requires manual checking.
- Consequential external actions remain approval-gated.
- AI output explains or assists; it does not silently override deterministic policy results.

## Anti-loop rule

Every engineering pass must end in one of three states:

1. **Verified and committed** — exact commit recorded.
2. **Blocked** — concrete missing capability/access stated.
3. **Needs investigation** — a bounded next inspection target is identified.

Do not repeat an already-verified inspection or claim a result that has not been observed.
