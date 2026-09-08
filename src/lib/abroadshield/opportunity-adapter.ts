import type { Opportunity } from "./opportunity-types";

export type OpportunityAdapterHealth = "ready" | "unavailable" | "failed";

export type OpportunityAdapterResult = {
  health: OpportunityAdapterHealth;
  opportunities: Opportunity[];
  error?: string;
};

/**
 * Shared adapter contract. Provider implementations own retrieval/parsing;
 * the application layer only accepts canonical, provenance-bearing records.
 */
export interface OpportunityAdapter {
  readonly sourceId: string;
  search(input: {
    query?: string;
    location?: string;
    category: string;
    asOf: string;
  }): Promise<OpportunityAdapterResult>;
}

export function validateOpportunityRecord(opportunity: Opportunity): boolean {
  return Boolean(
    opportunity.canonicalId &&
      opportunity.providerId &&
      opportunity.sourceUrl &&
      opportunity.title &&
      opportunity.employer &&
      opportunity.contractType &&
      opportunity.retrievedAt &&
      opportunity.provenance?.provider &&
      opportunity.provenance?.sourceUrl,
  );
}
