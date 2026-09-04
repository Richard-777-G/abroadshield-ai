import ZAI from "z-ai-web-dev-sdk";
import type { AgentCapability } from "./tool-registry";

type LiveToolResult = {
  capability: AgentCapability;
  status: "unconfigured" | "ready" | "failed";
  query: string;
  sources: Array<{ title: string; url: string; source: string; snippet?: string }>;
  message?: string;
};

const TAVILY_ENDPOINT = "https://api.tavily.com/search";
const LIVE_SEARCH_TIMEOUT_MS = 12_000;

function normalizeSources(items: Array<{ title?: unknown; name?: unknown; url?: unknown; source?: unknown; host_name?: unknown; snippet?: unknown; content?: unknown }> | undefined) {
  return (items ?? [])
    .map((item) => {
      const title = typeof item.title === "string" ? item.title : typeof item.name === "string" ? item.name : "";
      const url = typeof item.url === "string" ? item.url : "";
      if (!title || !url) return null;
      let source = typeof item.source === "string" ? item.source : typeof item.host_name === "string" ? item.host_name : "";
      if (!source) {
        try { source = new URL(url).hostname; } catch { source = "web"; }
      }
      const snippet = typeof item.snippet === "string" ? item.snippet : typeof item.content === "string" ? item.content : undefined;
      return { title, url, source, snippet };
    })
    .filter((item): item is { title: string; url: string; source: string; snippet?: string } => Boolean(item));
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("LIVE_SEARCH_TIMEOUT")), ms); });
  try { return await Promise.race([promise, timeout]); }
  finally { if (timer) clearTimeout(timer); }
}

async function searchWithZai(normalizedQuery: string, capability: AgentCapability): Promise<LiveToolResult> {
  try {
    const zai = await withTimeout(ZAI.create(), LIVE_SEARCH_TIMEOUT_MS);
    const raw = await withTimeout(zai.functions.invoke("web_search", { query: normalizedQuery, num: 10, recency_days: 30 }), LIVE_SEARCH_TIMEOUT_MS);
    const payload = raw as unknown;
    const items = Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : [];
    const sources = normalizeSources(items as Array<Record<string, unknown>>);
    return {
      capability,
      status: "ready",
      query: normalizedQuery,
      sources,
      message: sources.length ? `Found ${sources.length} current web results.` : "The live search returned no results.",
    };
  } catch (error) {
    console.error("[abroadshield/live-search/zai] error", error);
    return { capability, status: "failed", query: normalizedQuery, sources: [], message: "Live search could not be completed. Please retry." };
  }
}

/** Execute current-data capabilities through Tavily when configured, with the built-in ZAI web search as fallback. */
export async function executeLiveTool(
  capability: AgentCapability,
  query: string,
): Promise<LiveToolResult> {
  const normalizedQuery = query.trim().slice(0, 400);
  if (!normalizedQuery) {
    return { capability, status: "failed", query, sources: [], message: "A search query is required." };
  }

  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return searchWithZai(normalizedQuery, capability);

  try {
    const response = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ api_key: apiKey, query: normalizedQuery, search_depth: "basic", max_results: 10, include_answer: false, include_raw_content: false }),
      cache: "no-store",
      signal: AbortSignal.timeout(LIVE_SEARCH_TIMEOUT_MS),
    });
    if (response.ok) {
      const payload = (await response.json()) as { results?: Array<{ title?: string; url?: string; content?: string }> };
      const sources = normalizeSources(payload.results as Array<Record<string, unknown>> | undefined);
      return {
        capability,
        status: "ready",
        query: normalizedQuery,
        sources,
        message: sources.length ? `Found ${sources.length} current web results.` : "The live search returned no results.",
      };
    }

    console.warn(`[abroadshield/live-search] Tavily returned HTTP ${response.status}; falling back to ZAI web search.`);
    return searchWithZai(normalizedQuery, capability);
  } catch (error) {
    console.error("[abroadshield/live-search/tavily] error", error);
    return searchWithZai(normalizedQuery, capability);
  }
}
