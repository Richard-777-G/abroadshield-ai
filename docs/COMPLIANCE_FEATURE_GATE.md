# Compliance Feature Gate

This gate applies before enabling any new capability that processes personal data, uses AI for consequential decisions, handles employment or immigration workflows, or sends data to a third party.

## Required evidence

- [ ] Intended purpose documented.
- [ ] Data fields documented and minimized.
- [ ] Lawful-basis/privacy assessment completed or explicitly marked for legal review.
- [ ] Controller/processor/third-party roles assessed.
- [ ] International transfer and subprocessor implications assessed where applicable.
- [ ] Retention/deletion behavior defined.
- [ ] User transparency and applicable rights supported.
- [ ] Access control and connector scopes reviewed.
- [ ] AI use-case/risk classification recorded.
- [ ] Human oversight defined for consequential workflows.
- [ ] Output validation and prompt-injection boundary tested.
- [ ] Audit/event logging defined without unnecessary sensitive duplication.
- [ ] DPIA assessment completed where required or explicitly escalated for legal review.
- [ ] Provider terms and permitted-use constraints checked before production integration.

## Employment-specific gate

Student-facing opportunity assistance must remain distinguishable from employer-side candidate selection. Do not introduce employer-facing ranking, filtering, or candidate evaluation without a dedicated AI Act/GDPR assessment and legal review.

## Immigration/legal gate

No LLM output may become authoritative immigration/legal state without verified evidence, applicability, effective-period handling, and deterministic execution where the rule is machine-executable.

## External-action gate

A model may propose or prepare an external action. Only an approved executor may perform it. The system must record whether the action was merely prepared, user-approved, attempted, or externally confirmed.

## Release status vocabulary

Use explicit states:

- `not-assessed`
- `engineering-reviewed`
- `legal-review-required`
- `approved-for-development`
- `approved-for-production`
- `blocked`

Never convert an unresolved legal question into an assumed compliance claim.
