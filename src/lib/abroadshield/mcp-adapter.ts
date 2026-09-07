import { getCapability, isExperimentalCapability } from "./capability-registry";

export type McpCallResult = {
  status: "ready" | "unconfigured" | "blocked" | "failed";
  capability: string;
  tool?: string;
  result?: unknown;
  message?: string;
};

const MCP_PROTOCOL_VERSION = "2025-06-18";
const TIMEOUT_MS = 15_000;

function configured(): { endpoint: string; allowedTools: Set<string> } | null {
  const endpoint = process.env.ABROADSHIELD_MCP_ENDPOINT?.trim();
  const allowedTools = new Set((process.env.ABROADSHIELD_MCP_ALLOWED_TOOLS ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  if (!endpoint || allowedTools.size === 0) return null;
  return { endpoint, allowedTools };
}

async function rpc(endpoint: string, method: string, params: Record<string, unknown>, sessionId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`MCP endpoint returned HTTP ${response.status}.`);
  const session = response.headers.get("Mcp-Session-Id") ?? sessionId;
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  if (contentType.includes("text/event-stream")) {
    const data = text.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).filter(Boolean).at(-1);
    return { payload: data ? JSON.parse(data) : null, session };
  }
  return { payload: text ? JSON.parse(text) : null, session };
}

/**
 * Provider-neutral MCP boundary. It only reaches an explicitly configured endpoint and
 * only calls an explicitly allowlisted tool. MCP output is untrusted and must not become
 * authoritative policy/domain state without validation elsewhere.
 */
export async function callMcpCapability(capabilityId: string, tool: string, arguments_: Record<string, unknown> = {}): Promise<McpCallResult> {
  const capability = getCapability(capabilityId);
  if (!capability || !isExperimentalCapability(capabilityId)) return { status: "blocked", capability: capabilityId, tool, message: "Capability is not an experimental MCP capability." };
  const config = configured();
  if (!config) return { status: "unconfigured", capability: capabilityId, tool, message: "MCP is not configured. Set ABROADSHIELD_MCP_ENDPOINT and ABROADSHIELD_MCP_ALLOWED_TOOLS." };
  if (!config.allowedTools.has(tool)) return { status: "blocked", capability: capabilityId, tool, message: "MCP tool is not explicitly allowlisted." };

  try {
    const initialized = await rpc(config.endpoint, "initialize", {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "abroadshield-ai", version: "1.0.0" },
    });
    await rpc(config.endpoint, "notifications/initialized", {}, initialized.session ?? undefined);
    const called = await rpc(config.endpoint, "tools/call", { name: tool, arguments: arguments_ }, initialized.session ?? undefined);
    const payload = called.payload as { error?: { message?: string }; result?: unknown } | null;
    if (payload?.error) return { status: "failed", capability: capabilityId, tool, message: payload.error.message ?? "MCP tool call failed." };
    return { status: "ready", capability: capabilityId, tool, result: payload?.result ?? payload };
  } catch (error) {
    return { status: "failed", capability: capabilityId, tool, message: error instanceof Error ? error.message : "MCP request failed." };
  }
}
