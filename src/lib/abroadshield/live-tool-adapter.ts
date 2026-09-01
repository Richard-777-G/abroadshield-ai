import type { AgentCapability } from "./tool-registry";

type LiveToolResult = {
  capability: AgentCapability;
  status: "unconfigured" | "ready" | "failed";
  query: string;
  sources: Array<{ title: string; url: string; source: string; snippet?: string }>;
  message?: string;
};

const TAVILY_ENDPOINT = "https://api.tavily.com/search";

/** Execute current-data capabilities through the configured Tavily Search API. */
export async function executeLiveTool(
  capability: AgentCapability,
  query: string,
): Promise<LiveToolResult> {
  const normalizedQuery = query.trim().slice(0, 400);
  if (!normalizedQuery) {
    return { capability, status: "failed", query, sources: [], message: "A search query is required." };
  }

  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) {
    return {
      capability,
      status: "unconfigured",
      query: normalizedQuery,
      sources: [],
      message: "Live search is not configured for this deployment. No external results were claimed.",
    };
  }

  try {
    const response = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ api_key: apiKey, query: normalizedQuery, search_depth: "basic", max_results: 10, include_answer: false, include_raw_content: false }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return { capability, status: "failed", query: normalizedQuery, sources: [], message: `Live search provider returned HTTP ${response.status}.` };
    }

    const payload = (await response.json()) as {
      results?: Array<{ title?: string; url?: string; content?: string }>;
    };
    const sources = (payload.results ?? [])
      .filter((item) => typeof item.title === "string" && typeof item.url === "string")
      .map((item) => ({
        title: item.title!,
        url: item.url!,
        source: new URL(item.url!).hostname,
        snippet: item.content,
      }));

    return {
      capability,
      status: "ready",
      query: normalizedQuery,
      sources,
      message: sources.length ? `Found ${sources.length} current web results.` : "The live search returned no results.",
    };
  } catch (error) {
    console.error("[abroadshield/live-search] error", error);
    return { capability, status: "failed", query: normalizedQuery, sources: [], message: "Live search could not be completed. Please retry." };
  }
}
