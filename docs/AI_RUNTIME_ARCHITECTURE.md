# AbroadShield AI Runtime Architecture

## Runtime boundary

All model calls flow through `src/lib/abroadshield/ai-runtime.ts`. Application routes must not import an AI provider SDK directly.

The runtime boundary is responsible for:
- provider selection through `ABROADSHIELD_AI_PROVIDER`;
- provider authentication through server-only environment variables;
- model selection through `ABROADSHIELD_AI_MODEL`;
- provider endpoint overrides when required;
- request timeout and transport failure handling;
- normalized provider errors;
- optional JSON response mode.

## Providers

### Free-first development runtime

Set `ABROADSHIELD_AI_PROVIDER=openrouter` and configure `OPENROUTER_API_KEY`. When no model is explicitly selected, the runtime uses `openrouter/free`, which routes to available free models subject to OpenRouter's free-tier limits and availability.

This keeps development and early product testing independent of Vercel AI Gateway billing.

### Vercel AI Gateway

Set `ABROADSHIELD_AI_PROVIDER=gateway` and configure `AI_GATEWAY_API_KEY`. When no model is explicitly selected, the runtime uses `openai/gpt-5.5-fast` through the configured gateway endpoint.

The application therefore depends on an internal AI contract, not on a provider-specific SDK or billing arrangement. Switching providers is configuration, not an application rewrite.

## Provider selection precedence

1. Explicit `ABROADSHIELD_AI_PROVIDER=openrouter` or `gateway` is authoritative.
2. If no provider is explicitly selected, OpenRouter is preferred when `OPENROUTER_API_KEY` exists.
3. If OpenRouter is unavailable and `AI_GATEWAY_API_KEY` exists, the runtime uses the gateway.
4. If neither provider is configured, the runtime returns an explicit service-unavailable error.

There is no silent request-level provider fallback after a provider has been selected. This prevents mixed-provider execution and makes failures observable.

## Execution pipeline

1. UI submits an authenticated user request.
2. Chat route resolves the canonical database user and active journey phase.
3. Capability router detects an allowed capability.
4. Stage policy authorizes or blocks execution.
5. Task route creates a persisted `JourneyTask` and `task_started` event.
6. Live capabilities obtain current data through the explicitly configured live-search adapter.
7. The centralized AI runtime interprets profile data, task context and verified tool output.
8. The executor persists the result and emits `task_completed`, `task_blocked` or `task_failed`.
9. Chat records the conversational result in `AgentMessage`.
10. Journey/Dashboard surfaces read persisted state rather than maintaining a second task source of truth.

## Responsibility boundaries

- `capability-router.ts`: intent-to-capability classification only.
- `stage-orchestrator.ts`: stage policy and authorization only.
- `tool-registry.ts`: canonical capability metadata only.
- `live-tool-adapter.ts`: external current-data retrieval only.
- `ai-runtime.ts`: model transport only; no product/business rules.
- API routes: authentication, orchestration, persistence and response contracts.
- Prisma: durable user/journey/task/event/message state.

## Safety rules

- No provider SDK imports from product routes.
- No hidden provider fallback after an explicit provider selection.
- No fabricated live data.
- No external action is claimed without an executor result.
- Outbound communications remain approval-gated.
- Missing AI configuration is an explicit service-unavailable condition, not a fake response.
- Live-search unavailability is an explicit state, not a silent fallback.
