import type { OpportunityAdapter, OpportunityAdapterResult } from "./opportunity-adapter";
import type { Opportunity, OpportunityContractType } from "./opportunity-types";

type FranceTravailOffer = {
  id?: string;
  intitule?: string;
  dateCreation?: string;
  dateActualisation?: string;
  lieuTravail?: { libelle?: string; codePostal?: string; commune?: string };
  entreprise?: { nom?: string };
  typeContrat?: string;
  typeContratLibelle?: string;
  experienceLibelle?: string;
  formations?: Array<{ libelle?: string; exigence?: string }>;
  competences?: Array<{ libelle?: string; exigence?: string }>;
  langues?: Array<{ libelle?: string; exigence?: string }>;
  alternance?: boolean;
  origineOffre?: { urlOrigine?: string };
};

type FranceTravailSearchResponse = { resultats?: FranceTravailOffer[] };
type TokenResponse = { access_token?: string; expires_in?: number };

const API_BASE = "https://api.francetravail.io/partenaire/offresdemploi";
const TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire";
let tokenCache: { token: string; expiresAt: number } | undefined;

function mapContract(offer: FranceTravailOffer): OpportunityContractType {
  if (offer.alternance) return "apprenticeship";
  const code = (offer.typeContrat ?? "").toUpperCase();
  if (code === "CDI") return "full_time";
  if (code === "CDD" || code === "MIS" || code === "SAI") return "temporary";
  return "unknown";
}

function freshness(date: string | undefined, asOf: string): Opportunity["freshness"] {
  if (!date) return "unverified";
  const ageMs = new Date(asOf).getTime() - new Date(date).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) return "unverified";
  const days = ageMs / 86_400_000;
  if (days <= 7) return "fresh";
  if (days <= 30) return "aging";
  return "stale";
}

function toOpportunity(offer: FranceTravailOffer, asOf: string): Opportunity | undefined {
  if (!offer.id || !offer.intitule || !offer.entreprise?.nom) return undefined;
  const sourceUrl = offer.origineOffre?.urlOrigine;
  if (!sourceUrl) return undefined;

  const requiredEducation = offer.formations?.filter((item) => item.exigence === "E").map((item) => item.libelle).filter(Boolean) as string[] | undefined;
  const requiredSkills = offer.competences?.filter((item) => item.exigence === "E").map((item) => item.libelle).filter(Boolean) as string[] | undefined;
  const preferredSkills = offer.competences?.filter((item) => item.exigence !== "E").map((item) => item.libelle).filter(Boolean) as string[] | undefined;
  const requiredLanguages = offer.langues?.filter((item) => item.exigence === "E").map((item) => item.libelle).filter(Boolean) as string[] | undefined;
  const retrievedAt = asOf;

  return {
    canonicalId: `france-travail:${offer.id}`,
    providerId: "france-travail",
    providerOpportunityId: offer.id,
    sourceType: "government",
    sourceUrl,
    applicationUrl: sourceUrl,
    title: offer.intitule,
    employer: offer.entreprise.nom,
    location: offer.lieuTravail?.libelle,
    geographicArea: offer.lieuTravail?.codePostal,
    contractType: mapContract(offer),
    requiredEducation,
    requiredSkills,
    preferredSkills,
    requiredLanguages,
    applicationRequirements: [offer.experienceLibelle, offer.typeContratLibelle].filter(Boolean) as string[],
    publishedAt: offer.dateCreation,
    retrievedAt,
    freshness: freshness(offer.dateActualisation ?? offer.dateCreation, asOf),
    applicationCapability: "L1",
    eligibility: "requires_work_authorization_check",
    provenance: { provider: "France Travail API Offres d'emploi", sourceUrl, retrievedAt },
  };
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) return tokenCache.token;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "o2dsoffre api_offresdemploiv2",
  });
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`France Travail token request failed (${response.status}).`);
  const payload = (await response.json()) as TokenResponse;
  if (!payload.access_token) throw new Error("France Travail token response did not contain an access token.");
  tokenCache = { token: payload.access_token, expiresAt: now + Math.max(60, payload.expires_in ?? 900) * 1000 };
  return payload.access_token;
}

async function searchOffers(input: {
  query?: string;
  location?: string;
  category: string;
  asOf: string;
}, clientId: string, clientSecret: string): Promise<Opportunity[]> {
  const token = await getAccessToken(clientId, clientSecret);
  const params = new URLSearchParams({ range: "0-49", sort: "0" });
  if (input.query) params.set("motsCles", input.query);

  if (input.location?.trim().toLowerCase() === "paris") {
    params.set("commune", "75056");
    params.set("rayon", "20");
  }

  if (input.category === "apprenticeship") params.set("natureContrat", "E1");

  const response = await fetch(`${API_BASE}/v2/offres/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 204) return [];
  if (!response.ok) throw new Error(`France Travail offers request failed (${response.status}).`);
  const payload = (await response.json()) as FranceTravailSearchResponse;
  return (payload.resultats ?? []).map((offer) => toOpportunity(offer, input.asOf)).filter((offer): offer is Opportunity => Boolean(offer));
}

export function createFranceTravailAdapter(): OpportunityAdapter {
  return {
    sourceId: "france-travail",
    async search(input): Promise<OpportunityAdapterResult> {
      const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
      const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return { health: "unavailable", opportunities: [], error: "France Travail API credentials are not configured." };
      }

      try {
        return { health: "ready", opportunities: await searchOffers(input, clientId, clientSecret) };
      } catch (error) {
        return { health: "failed", opportunities: [], error: error instanceof Error ? error.message : "France Travail search failed." };
      }
    },
  };
}
