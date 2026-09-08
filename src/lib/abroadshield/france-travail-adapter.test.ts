import { describe, expect, test } from "bun:test";
import { createFranceTravailAdapter } from "./france-travail-adapter";

describe("France Travail adapter safety boundary", () => {
  test("reports unavailable instead of fabricating offers when credentials are absent", async () => {
    const previousId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
    const previousSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
    delete process.env.FRANCE_TRAVAIL_CLIENT_ID;
    delete process.env.FRANCE_TRAVAIL_CLIENT_SECRET;

    try {
      const result = await createFranceTravailAdapter().search({
        query: "data analyst",
        location: "Paris",
        category: "internship",
        asOf: "2026-09-08T00:00:00.000Z",
      });
      expect(result.health).toBe("unavailable");
      expect(result.opportunities).toEqual([]);
    } finally {
      if (previousId === undefined) delete process.env.FRANCE_TRAVAIL_CLIENT_ID;
      else process.env.FRANCE_TRAVAIL_CLIENT_ID = previousId;
      if (previousSecret === undefined) delete process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
      else process.env.FRANCE_TRAVAIL_CLIENT_SECRET = previousSecret;
    }
  });

  test("does not expose credentials through the returned error contract", async () => {
    process.env.FRANCE_TRAVAIL_CLIENT_ID = "test-client-id";
    process.env.FRANCE_TRAVAIL_CLIENT_SECRET = "test-client-secret";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response("upstream failure", { status: 500 });

    try {
      const result = await createFranceTravailAdapter().search({
        query: "internship",
        location: "Paris",
        category: "internship",
        asOf: "2026-09-08T00:00:00.000Z",
      });
      expect(result.health).toBe("failed");
      expect(result.opportunities).toEqual([]);
      expect(result.error).not.toContain("test-client-secret");
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.FRANCE_TRAVAIL_CLIENT_ID;
      delete process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
    }
  });
});
