import type { Opportunity } from "./opportunity-types";
import type { OpportunityAdapter, OpportunityAdapterResult } from "./opportunity-adapter";

/**
 * France Travail integration boundary.
 *
 * The public France Travail API requires a licensed developer application.
 * We deliberately do not hard-code undocumented endpoints, credentials, or
 * scrape the candidate website. Until the licensed API contract is configured,
 * this adapter reports `unavailable` rather than fabricating listings.
 */
export type FranceTravailClient = {
  searchOffers(input: {
    query?: string;
    location?: string;
    category: string;
    asOf: string;
  }): Promise<Opportunity[]>;
};

export function createFranceTravailAdapter(
  client?: FranceTravailClient,
): OpportunityAdapter {
  return {
    sourceId: "france-travail",
    async search(input): Promise<OpportunityAdapterResult> {
      if (!client) {
        return {
          health: "unavailable",
          opportunities: [],
          error: "France Travail API client is not configured.",
        };
      }

      try {
        const opportunities = await client.searchOffers(input);
        return { health: "ready", opportunities };
      } catch (error) {
        return {
          health: "failed",
          opportunities: [],
          error: error instanceof Error ? error.message : "France Travail search failed.",
        };
      }
    },
  };
}
