import type { CountryPolicyRegistry } from "./policy-registry";
import { francePolicyRegistry } from "./policies/france-registry";
import { countryContext } from "./journey";

const COUNTRY_POLICY_REGISTRIES: Record<string, CountryPolicyRegistry> = {
  FR: francePolicyRegistry,
};

export function getCountryPolicyRegistry(destination?: string): CountryPolicyRegistry | null {
  const code = countryContext(destination).code;
  return COUNTRY_POLICY_REGISTRIES[code] ?? null;
}
