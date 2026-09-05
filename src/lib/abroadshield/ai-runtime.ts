export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AICompletionOptions = {
  messages: AIMessage[];
  timeoutMs?: number;
  jsonMode?: boolean;
};

type AIProvider = "openrouter" | "gateway";
type ProviderPayload = {
  choices?: Array<{
    text?: unknown;
    finish_reason?: unknown;
    message?: { content?: unknown; refusal?: unknown; reasoning?: unknown; reasoning_content?: unknown };
  }>;
  error?: { message?: string; code?: unknown };
};

type RuntimeConfig = {
  provider: AIProvider;
  apiKey: string;
  endpoint: string;
  model: string;
  fallbackModels: string[];
};

export class AIRuntimeError extends Error {
  code: "AI_NOT_CONFIGURED" | "AI_REQUEST_FAILED" | "AI_INVALID_RESPONSE";
  status: number;

  constructor(code: AIRuntimeError["code"], message: string, status = code === "AI_NOT_CONFIGURED" ? 503 : 502) {
    super(message);
    this.name = "AIRuntimeError";
    this.code = code;
    this.status = status;
  }
}

const DEFAULT_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const DEFAULT_GATEWAY_MODEL = "openai/gpt-5.5-fast";
const DEFAULT_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "openrouter/free";
const DEFAULT_OPENROUTER_FALLBACK_MODEL = "openrouter/auto";
const DEFAULT_TIMEOUT_MS = 25_000;

function parseFallbackModels(value: string | undefined, primary: string): string[] {
  const configured = value
    ?.split(",")
    .map((model) => model.trim())
    .filter(Boolean)
    .filter((model, index, models) => models.indexOf(model) === index && model !== primary);

  return configured?.length ? configured : [DEFAULT_OPENROUTER_FALLBACK_MODEL];
}

function getRuntimeConfig(): RuntimeConfig {
  const requestedProvider = process.env.ABROADSHIELD_AI_PROVIDER?.trim().toLowerCase();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();

  if (requestedProvider === "openrouter") {
    if (!openRouterKey) throw new AIRuntimeError("AI_NOT_CONFIGURED", "OpenRouter is selected but OPENROUTER_API_KEY is not configured.", 503);
    const model = process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
    return { provider: "openrouter", apiKey: openRouterKey, endpoint: process.env.OPENROUTER_BASE_URL?.trim() || DEFAULT_OPENROUTER_URL, model, fallbackModels: parseFallbackModels(process.env.ABROADSHIELD_AI_FALLBACK_MODELS, model) };
  }

  if (requestedProvider === "gateway") {
    if (!gatewayKey) throw new AIRuntimeError("AI_NOT_CONFIGURED", "AI Gateway is selected but AI_GATEWAY_API_KEY is not configured.", 503);
    const model = process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_GATEWAY_MODEL;
    return { provider: "gateway", apiKey: gatewayKey, endpoint: process.env.AI_GATEWAY_BASE_URL?.trim() || DEFAULT_GATEWAY_URL, model, fallbackModels: [] };
  }

  if (openRouterKey) {
    const model = process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
    return { provider: "openrouter", apiKey: openRouterKey, endpoint: process.env.OPENROUTER_BASE_URL?.trim() || DEFAULT_OPENROUTER_URL, model, fallbackModels: parseFallbackModels(process.env.ABROADSHIELD_AI_FALLBACK_MODELS, model) };
  }

  if (gatewayKey) {
    const model = process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_GATEWAY_MODEL;
    return { provider: "gateway", apiKey: gatewayKey, endpoint: process.env.AI_GATEWAY_BASE_URL?.trim() || DEFAULT_GATEWAY_URL, model, fallbackModels: [] };
  }

  throw new AIRuntimeError("AI_NOT_CONFIGURED", "No AI provider is configured. Set OPENROUTER_API_KEY for the OpenRouter runtime or AI_GATEWAY_API_KEY for Vercel AI Gateway.", 503);
}

function providerHeaders(provider: AIProvider, apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(provider === "openrouter" ? { "HTTP-Referer": "https://abroadshield-ai.vercel.app", "X-Title": "AbroadShield AI" } : {}),
  };
}

function extractText(payload: ProviderPayload): string {
  const choice = payload.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const text = content.map((part) => {
      if (!part || typeof part !== "object") return "";
      const value = part as Record<string, unknown>;
      return typeof value.text === "string" ? value.text : "";
    }).filter(Boolean).join("\n").trim();
    if (text) return text;
  }
  if (typeof choice?.text === "string" && choice.text.trim()) return choice.text.trim();
  return "";
}

async function requestProvider(endpoint: string, headers: HeadersInit, body: Record<string, unknown>, timeoutMs: number): Promise<{ response: Response; payload: ProviderPayload | null }> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((error) => {
    if (error instanceof Error && error.name === "TimeoutError") throw new AIRuntimeError("AI_REQUEST_FAILED", "The AI service took too long to respond.", 504);
    throw new AIRuntimeError("AI_REQUEST_FAILED", "The AI service could not be reached.", 502);
  });
  const payload = (await response.json().catch(() => null)) as ProviderPayload | null;
  return { response, payload };
}

async function requestModel(config: RuntimeConfig, model: string, messages: AIMessage[], timeoutMs: number, jsonMode: boolean): Promise<{ content: string; response: Response | null; payload: ProviderPayload | null }> {
  const headers = providerHeaders(config.provider, config.apiKey);
  const bodies: Record<string, unknown>[] = [{ model, messages, ...(jsonMode ? { response_format: { type: "json_object" } } : {}) }];
  if (config.provider === "openrouter" && jsonMode) bodies.push({ model, messages });

  let lastResponse: Response | null = null;
  let lastPayload: ProviderPayload | null = null;
  for (const body of bodies) {
    const { response, payload } = await requestProvider(config.endpoint, headers, body, timeoutMs);
    lastResponse = response;
    lastPayload = payload;
    if (!response.ok) {
      const providerMessage = payload?.error?.message;
      if (config.provider === "openrouter" && response.status === 400 && body !== bodies[bodies.length - 1]) continue;
      throw new AIRuntimeError("AI_REQUEST_FAILED", providerMessage || "The AI service returned an error.", response.status >= 500 ? 502 : response.status);
    }
    const content = extractText(payload || {});
    if (content) return { content, response, payload };
  }
  return { content: "", response: lastResponse, payload: lastPayload };
}

export async function generateText({ messages, timeoutMs = DEFAULT_TIMEOUT_MS, jsonMode = false }: AICompletionOptions): Promise<string> {
  const config = getRuntimeConfig();
  const models = [config.model, ...config.fallbackModels];
  let lastPayload: ProviderPayload | null = null;
  let lastResponse: Response | null = null;

  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    try {
      const result = await requestModel(config, model, messages, timeoutMs, jsonMode);
      lastPayload = result.payload;
      lastResponse = result.response;
      if (result.content) return result.content;
      console.warn("[abroadshield/ai-runtime] model returned no usable text; trying fallback", JSON.stringify({ provider: config.provider, model, fallbackIndex: index, choices: result.payload?.choices?.length || 0, finishReason: result.payload?.choices?.[0]?.finish_reason || null }));
    } catch (error) {
      if (error instanceof AIRuntimeError && index + 1 < models.length) {
        console.warn("[abroadshield/ai-runtime] model attempt failed; trying fallback", JSON.stringify({ provider: config.provider, model, code: error.code, status: error.status }));
        continue;
      }
      throw error;
    }
  }

  console.error("[abroadshield/ai-runtime] all model recovery attempts exhausted", JSON.stringify({ provider: config.provider, modelsTried: models, status: lastResponse?.status || null, choices: lastPayload?.choices?.length || 0, finishReason: lastPayload?.choices?.[0]?.finish_reason || null }));
  throw new AIRuntimeError("AI_INVALID_RESPONSE", "The AI service returned no usable text.", 502);
}
