import type { AgentCapability } from "./tool-registry";

type LiveToolResult = {
  capability: AgentCapability;
  status: "unconfigured" | "ready" | "failed";
  query: string;
  sources: Array<{ title: string; url: string; source: string; snippet?: string }>;
  message?: string;
};

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

/** Execute current-data capabilities through the configured Brave Search API. */
export async function executeLiveTool(
  capability: AgentCapability,
  query: string,
): Promise<LiveToolResult> {
  const normalizedQuery = query.trim().slice(0, 400);
  if (!normalizedQuery) {
    return { capability, status: "failed", query, sources: [], message: "A search query is required." };
  }

  const apiKey = process.env.BRAVE_SEARCH_API_KEY?.trim();
  if (!apiKey) {
    return {
      capability,
      status: "unconfigured",
      query: normalizedQuery,
      sources: [],
      message: "Live search is not configured for this deployment. No external results were claimed.",
    };
  }

  const url = new URL(BRAVE_ENDPOINT);
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("count", "10");
  url.searchParams.set("search_lang", "en");
  url.searchParams.set("safesearch", "moderate");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return { capability, status: "failed", query: normalizedQuery, sources: [], message: `Live search provider returned HTTP ${response.status}.` };
    }

    const payload = (await response.json()) as {
      web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
    };
    const sources = (payload.web?.results ?? [])
      .filter((item) => typeof item.title === "string" && typeof item.url === "string")
      .map((item) => ({
        title: item.title!,
        url: item.url!,
        source: new URL(item.url!).hostname,
        snippet: item.description,
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
