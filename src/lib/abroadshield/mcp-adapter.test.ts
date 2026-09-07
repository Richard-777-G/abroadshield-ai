import { describe, expect, test } from "bun:test";
import { callMcpCapability } from "./mcp-adapter";

describe("MCP adapter", () => {
  test("never silently enables an unconfigured MCP provider", async () => {
    const endpoint = process.env.ABROADSHIELD_MCP_ENDPOINT;
    const tools = process.env.ABROADSHIELD_MCP_ALLOWED_TOOLS;
    delete process.env.ABROADSHIELD_MCP_ENDPOINT;
    delete process.env.ABROADSHIELD_MCP_ALLOWED_TOOLS;
    try {
      const result = await callMcpCapability("mcp_hub_search", "search");
      expect(result.status).toBe("unconfigured");
    } finally {
      if (endpoint !== undefined) process.env.ABROADSHIELD_MCP_ENDPOINT = endpoint;
      if (tools !== undefined) process.env.ABROADSHIELD_MCP_ALLOWED_TOOLS = tools;
    }
  });

  test("rejects non-MCP capabilities at the adapter boundary", async () => {
    const result = await callMcpCapability("france_policy_engine", "search");
    expect(result.status).toBe("blocked");
  });
});
