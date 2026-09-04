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
    message?: {
      content?: unknown;
      refusal?: unknown;
      reasoning?: unknown;
      reasoning_content?: unknown;
    };
  }>;
  error?: { message?: string; code?: unknown };
};

export class AIRuntimeError extends Error {
  code: "AI_NOT_CONFIGURED" | "AI_REQUEST_FAILED" | "AI_INVALID_RESPONSE";
  status: number;

  constructor(
    code: AIRuntimeError["code"],
    message: string,
    status = code === "AI_NOT_CONFIGURED" ? 503 : 502,
  ) {
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
const DEFAULT_TIMEOUT_MS = 25_000;

function getRuntimeConfig(): {
  provider: AIProvider;
  apiKey: string;
  endpoint: string;
  model: string;
} {
  const requestedProvider = process.env.ABROADSHIELD_AI_PROVIDER?.trim().toLowerCase();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim();

  if (requestedProvider === "openrouter") {
    if (!openRouterKey) {
      throw new AIRuntimeError(
        "AI_NOT_CONFIGURED",
        "OpenRouter is selected but OPENROUTER_API_KEY is not configured.",
        503,
      );
    }
    return {
      provider: "openrouter",
      apiKey: openRouterKey,
      endpoint: process.env.OPENROUTER_BASE_URL?.trim() || DEFAULT_OPENROUTER_URL,
      model: process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL,
    };
  }

  if (requestedProvider === "gateway") {
    if (!gatewayKey) {
      throw new AIRuntimeError(
        "AI_NOT_CONFIGURED",
        "AI Gateway is selected but AI_GATEWAY_API_KEY is not configured.",
        503,
      );
    }
    return {
      provider: "gateway",
      apiKey: gatewayKey,
      endpoint: process.env.AI_GATEWAY_BASE_URL?.trim() || DEFAULT_GATEWAY_URL,
      model: process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_GATEWAY_MODEL,
    };
  }

  if (openRouterKey) {
    return {
      provider: "openrouter",
      apiKey: openRouterKey,
      endpoint: process.env.OPENROUTER_BASE_URL?.trim() || DEFAULT_OPENROUTER_URL,
      model: process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL,
    };
  }

  if (gatewayKey) {
    return {
      provider: "gateway",
      apiKey: gatewayKey,
      endpoint: process.env.AI_GATEWAY_BASE_URL?.trim() || DEFAULT_GATEWAY_URL,
      model: process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_GATEWAY_MODEL,
    };
  }

  throw new AIRuntimeError(
    "AI_NOT_CONFIGURED",
    "No AI provider is configured. Set OPENROUTER_API_KEY for the free OpenRouter runtime or AI_GATEWAY_API_KEY for Vercel AI Gateway.",
    503,
  );
}

function providerHeaders(provider: AIProvider, apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(provider === "openrouter"
      ? {
          "HTTP-Referer": "https://abroadshield-ai.vercel.app",
          "X-OpenRouter-Title": "AbroadShield AI",
        }
      : {}),
  };
}

function extractText(payload: ProviderPayload): string {
  const choice = payload.choices?.[0];
  const content = choice?.message?.content;

  if (typeof content === "string" && content.trim()) return content.trim();

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        const value = part as Record<string, unknown>;
        return typeof value.text === "string" ? value.text : "";
      })
      .filter(Boolean)
      .join("\n")
      .trim();
    if (text) return text;
  }

  if (typeof choice?.text === "string" && choice.text.trim()) return choice.text.trim();

  return "";
}

export async function generateText({
  messages,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  jsonMode = false,
}: AICompletionOptions): Promise<string> {
  const config = getRuntimeConfig();

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: providerHeaders(config.provider, config.apiKey),
    body: JSON.stringify({
      model: config.model,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((error) => {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new AIRuntimeError("AI_REQUEST_FAILED", "The AI service took too long to respond.", 504);
    }
    throw new AIRuntimeError("AI_REQUEST_FAILED", "The AI service could not be reached.", 502);
  });

  const payload = (await response.json().catch(() => null)) as ProviderPayload | null;

  if (!response.ok) {
    const providerMessage = payload?.error?.message;
    console.error(
      "[abroadshield/ai-runtime] provider request failed",
      config.provider,
      response.status,
      providerMessage || "unknown error",
    );
    throw new AIRuntimeError(
      "AI_REQUEST_FAILED",
      providerMessage || "The AI service returned an error.",
      response.status >= 500 ? 502 : response.status,
    );
  }

  const content = extractText(payload || {});
  if (!content) {
    const choice = payload?.choices?.[0];
    console.error(
      "[abroadshield/ai-runtime] provider returned no text",
      JSON.stringify({
        provider: config.provider,
        model: config.model,
        choices: payload?.choices?.length || 0,
        finishReason: choice?.finish_reason || null,
        hasContent: choice?.message?.content != null,
        hasRefusal: choice?.message?.refusal != null,
        hasReasoning: choice?.message?.reasoning != null || choice?.message?.reasoning_content != null,
      }),
    );
    throw new AIRuntimeError("AI_INVALID_RESPONSE", "The AI service returned no usable text.", 502);
  }

  return content;
}
