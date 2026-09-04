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

type NormalizedSource = {
  title: string;
  url: string;
  source: string;
  snippet: string | undefined;
};

function normalizeSources(items: Array<{ title?: unknown; name?: unknown; url?: unknown; source?: unknown; host_name?: unknown; snippet?: unknown; content?: unknown }> | undefined): NormalizedSource[] {
  return (items ?? [])
    .map((item): NormalizedSource | null => {
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
    .filter((item): item is NormalizedSource => item !== null);
}

/** Execute live-data capabilities through the explicitly configured search provider. */
export async function executeLiveTool(capability: AgentCapability, query: string): Promise<LiveToolResult> {
  const normalizedQuery = query.trim().slice(0, 400);
  if (!normalizedQuery) return { capability, status: "failed", query, sources: [], message: "A search query is required." };

  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) {
    return { capability, status: "unconfigured", query: normalizedQuery, sources: [], message: "Live search is not configured. Add TAVILY_API_KEY to enable current web data." };
  }

  try {
    const response = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ api_key: apiKey, query: normalizedQuery, search_depth: "basic", max_results: 10, include_answer: false, include_raw_content: false }),
      cache: "no-store",
      signal: AbortSignal.timeout(LIVE_SEARCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn(`[abroadshield/live-search] provider returned HTTP ${response.status}`);
      return { capability, status: "failed", query: normalizedQuery, sources: [], message: "Live search is temporarily unavailable. Please retry." };
    }
    const payload = (await response.json()) as { results?: Array<{ title?: string; url?: string; content?: string }> };
    const sources = normalizeSources(payload.results as Array<Record<string, unknown>> | undefined);
    return { capability, status: "ready", query: normalizedQuery, sources, message: sources.length ? `Found ${sources.length} current web results.` : "The live search returned no results." };
  } catch (error) {
    console.error("[abroadshield/live-search] provider error", error);
    return { capability, status: "failed", query: normalizedQuery, sources: [], message: "Live search could not be completed. Please retry." };
  }
}
