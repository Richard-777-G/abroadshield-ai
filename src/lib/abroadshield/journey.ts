import { VALID_PHASES, type PhaseId } from "./phase";

export { VALID_PHASES, type PhaseId } from "./phase";

export function normalizePhase(value?: string): PhaseId {
  return VALID_PHASES.includes(value as PhaseId) ? (value as PhaseId) : "pre-departure";
}

export const COUNTRY_DEFAULTS: Record<string, { flag: string; code: string; authority: string }> = {
  "United Kingdom": { flag: "🇬🇧", code: "GB", authority: "UK government immigration and education authorities" },
  "United States": { flag: "🇺🇸", code: "US", authority: "U.S. government immigration authorities" },
  Canada: { flag: "🇨🇦", code: "CA", authority: "Canadian government immigration authorities" },
  Australia: { flag: "🇦🇺", code: "AU", authority: "Australian government immigration authorities" },
  Germany: { flag: "🇩🇪", code: "DE", authority: "German government immigration authorities" },
  Ireland: { flag: "🇮🇪", code: "IE", authority: "Irish government immigration authorities" },
  Netherlands: { flag: "🇳🇱", code: "NL", authority: "Dutch government immigration authorities" },
  France: { flag: "🇫🇷", code: "FR", authority: "French government immigration authorities" },
  "New Zealand": { flag: "🇳🇿", code: "NZ", authority: "New Zealand immigration authorities" },
  Singapore: { flag: "🇸🇬", code: "SG", authority: "Singapore immigration authorities" },
};

export function countryContext(destination?: string) {
  return COUNTRY_DEFAULTS[destination || ""] ?? { flag: "🌍", code: "", authority: "the relevant official authority for the destination" };
}
