export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AICompletionOptions = {
  messages: AIMessage[];
  timeoutMs?: number;
  jsonMode?: boolean;
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
const DEFAULT_MODEL = "openai/gpt-5.5-fast";
const DEFAULT_TIMEOUT_MS = 25_000;

function getRuntimeConfig() {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  if (!apiKey) {
    throw new AIRuntimeError(
      "AI_NOT_CONFIGURED",
      "AI Gateway is not configured. Set AI_GATEWAY_API_KEY in the server environment.",
      503,
    );
  }

  return {
    apiKey,
    endpoint: process.env.AI_GATEWAY_BASE_URL?.trim() || DEFAULT_GATEWAY_URL,
    model: process.env.ABROADSHIELD_AI_MODEL?.trim() || DEFAULT_MODEL,
  };
}

export async function generateText({ messages, timeoutMs = DEFAULT_TIMEOUT_MS, jsonMode = false }: AICompletionOptions): Promise<string> {
  const config = getRuntimeConfig();

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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

  const payload = (await response.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: unknown } }>; error?: { message?: string } }
    | null;

  if (!response.ok) {
    const providerMessage = payload?.error?.message;
    console.error("[abroadshield/ai-runtime] provider request failed", response.status, providerMessage || "unknown error");
    throw new AIRuntimeError(
      "AI_REQUEST_FAILED",
      providerMessage || "The AI service returned an error.",
      response.status >= 500 ? 502 : response.status,
    );
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new AIRuntimeError("AI_INVALID_RESPONSE", "The AI service returned an empty response.", 502);
  }

  return content.trim();
}
