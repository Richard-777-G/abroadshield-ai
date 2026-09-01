# AbroadShield workspace cleanup plan

## Product rule
Authenticated surfaces are operational workspaces, not product brochures. Every visible control must either execute a real supported action, open a real workflow, or show verified state.

## Surface responsibilities
- Dashboard: prioritize what needs attention now and provide direct entry points to executable work.
- Agent: interpret the user's request, select a supported capability/tool, execute it, persist the result, and request approval before outbound action.
- Journey: represent the student's canonical sequence of phases, requirements, tasks, evidence, deadlines, and completion state. Avoid duplicating Agent instructions or marketing copy.
- Connections: show only connection states the system can verify; distinguish connected, available-to-connect, and external/unavailable.
- Jobs & Network: show verified records/results and actionable follow-ups; never imply live access where none exists.
- Countries: authoritative reference/context layer feeding workflows, not a duplicate task dashboard.

## Cleanup rules
1. Delete or stop rendering duplicate marketing sections inside authenticated views.
2. Remove hard-coded demo activity, fake counters, fake approvals, fake deadlines, and fake personal records from operational components.
3. Remove dead navigation/actions that have no handler or backend support.
4. Prefer one source of truth for journey/task state.
5. Lazy-load expensive views and media where it materially improves initial render.
6. Keep animation purposeful: transition between meaningful states; do not animate every static block.
7. Keep copy destination-neutral unless a real student profile supplies the destination.
8. Never claim an external action occurred unless the connector reports success.
9. Errors must be actionable and recoverable; avoid silent failures.
10. Before production, verify build, authentication, workspace routing, task execution, and empty/error states.

## Implementation order
1. Establish clean authenticated shell and responsibilities.
2. Remove dead/demo UI and unused imports/components after reference audit.
3. Normalize task/action contracts between UI and executor.
4. Add verified tool/connector execution and persisted results.
5. Make Journey render the canonical persisted task graph.
6. Make Dashboard a projection of urgent/next work, not another data store.
7. Performance pass and production smoke tests.
