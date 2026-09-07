import { PolicyVersionRegistry, type Applicability, type PolicyRuleVersion, type PolicySelection } from "./policy-versioning";
import type { PolicyPhase } from "./types/policy";

export type CountryPolicyQuery = Applicability & {
  asOf: string;
};

export class CountryPolicyRegistry {
  private readonly registry = new PolicyVersionRegistry();

  register(version: PolicyRuleVersion): void {
    this.registry.register(version);
  }

  current(ruleId: string, query: CountryPolicyQuery): PolicySelection {
    return this.registry.getCurrent(ruleId, query.asOf, {
      country: query.country,
      jurisdiction: query.jurisdiction,
      phase: query.phase,
      topic: query.topic,
      conditions: query.conditions,
    });
  }

  versions(ruleId?: string): PolicyRuleVersion[] {
    return this.registry.list(ruleId);
  }
}

export const policyPhase = (phase: PolicyPhase): PolicyPhase => phase;
