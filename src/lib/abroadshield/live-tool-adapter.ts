import type { AgentCapability } from "./tool-registry";

type LiveToolResult = {
  capability: AgentCapability;
  status: "unconfigured" | "ready";
  query: string;
  sources: Array<{ title: string; url: string; source: string }>;
  message?: string;
};

/**
 * Server-side boundary for capabilities that require current external data.
 * It deliberately returns an explicit unconfigured state until a real search
 * provider is installed and configured; it never manufactures search results.
 */
export async function executeLiveTool(
  capability: AgentCapability,
  query: string,
): Promise<LiveToolResult> {
  if (!query.trim()) {
    return { capability, status: "unconfigured", query, sources: [], message: "A search query is required." };
  }

  const provider = process.env.ABROADSHIELD_SEARCH_PROVIDER?.trim();
  const apiKey = process.env.ABROADSHIELD_SEARCH_API_KEY?.trim();

  if (!provider || !apiKey) {
    return {
      capability,
      status: "unconfigured",
      query,
      sources: [],
      message:
        "Live search is not configured for this deployment. No jobs, housing listings, or current external results were claimed.",
    };
  }

  // Provider-specific execution belongs behind this boundary. Do not silently
  // guess an API contract or scrape third-party sites without an approved adapter.
  return {
    capability,
    status: "unconfigured",
    query,
    sources: [],
    message: `Search provider "${provider}" is configured but has no approved adapter yet. No external result was claimed.`,
  };
}
