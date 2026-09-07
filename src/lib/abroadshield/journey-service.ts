import { db } from "@/lib/db";
import { generateText, AIRuntimeError } from "./ai-runtime";
import { buildAgentContext, type AgentProfile } from "./task-context";
import { normalizePhase } from "./journey";
import { STAGE_POLICIES } from "./stage-orchestrator";
import { parseModelJson } from "./parse-json";

type JourneyProfileInput = Partial<Record<"origin" | "destination" | "course" | "university" | "preferredUniversities" | "careerGoal" | "intake" | "currentPhase" | "readiness" | "onboarded" | "documentsTotal" | "documentsVerified" | "visaAppointment" | "funding" | "homeLanguage", string | number | boolean | null>>;

const PROFILE_FIELDS = ["origin", "destination", "course", "university", "preferredUniversities", "careerGoal", "intake", "currentPhase", "readiness", "onboarded", "documentsTotal", "documentsVerified", "visaAppointment", "funding", "homeLanguage"] as const;

export function sanitizeJourneyProfile(input: JourneyProfileInput) {
  const out: Record<string, string | number | boolean | null> = {};
  for (const key of PROFILE_FIELDS) if (input[key] !== undefined) out[key] = input[key] ?? null;
  if (typeof out.currentPhase === "string") out.currentPhase = normalizePhase(out.currentPhase);
  for (const key of ["readiness", "documentsTotal", "documentsVerified"]) {
    if (out[key] !== undefined) out[key] = Math.max(0, Number(out[key]) || 0);
  }
  return out;
}

export async function getJourneyWorkspaceData(userId: string) {
  const [profile, events, tasks] = await Promise.all([
    db.journeyProfile.findUnique({ where: { userId } }),
    db.journeyEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.journeyTask.findMany({ where: { userId }, orderBy: [{ status: "asc" }, { dueAt: "asc" }], take: 100 }),
  ]);
  return { profile, events, tasks };
}

export async function getAgentProfile(userId: string): Promise<AgentProfile | null> {
  const [user, journey] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.journeyProfile.findUnique({ where: { userId } }),
  ]);
  if (!user) return null;
  return {
    name: user.name ?? undefined,
    email: user.email,
    origin: journey?.origin,
    destination: journey?.destination,
    course: journey?.course,
    university: journey?.university,
    intake: journey?.intake,
    currentPhase: normalizePhase(journey?.currentPhase),
    documentsTotal: journey?.documentsTotal,
    documentsVerified: journey?.documentsVerified,
    visaAppointment: journey?.visaAppointment ?? undefined,
    funding: journey?.funding ?? undefined,
    homeLanguage: journey?.homeLanguage ?? undefined,
  };
}

export async function updateJourneyProfile(userId: string, input: JourneyProfileInput) {
  const data = sanitizeJourneyProfile(input);
  const previous = await db.journeyProfile.findUnique({ where: { userId } });
  const profile = await db.journeyProfile.upsert({ where: { userId }, update: data, create: { userId, ...data } });
  const phaseChanged = previous ? previous.currentPhase !== profile.currentPhase : false;
  await db.journeyEvent.create({
    data: {
      userId,
      phase: profile.currentPhase,
      type: phaseChanged ? "phase_changed" : "profile_updated",
      title: phaseChanged ? `Moved to ${profile.currentPhase}` : "Journey profile updated",
      detail: "Journey strategy saved to the persistent record.",
    },
  });
  return profile;
}

export async function generateJourneyIntelligence(userId: string) {
  const profile = await getAgentProfile(userId);
  if (!profile) return null;
  const { events, tasks } = await getJourneyWorkspaceData(userId);
  const prompt = [
    "You are AbroadShield AI's Journey Intelligence layer.",
    "Build an explainable, student-specific four-stage strategy from the authenticated profile and persisted journey history.",
    "Do not invent facts. Surface missing information explicitly.",
    "Current stage gets immediate priorities; future stages get preparation guidance.",
    "For every stage provide objective, whyItMatters, abroadShieldWill, studentWill, prerequisites, risks, firstActions.",
    "Also provide studentSummary, careerDirection, biggestUnknowns, next90Days.",
    "Use persisted events and tasks to avoid recommending work already completed unless it needs follow-up.",
    "Return valid JSON only.",
    "PROFILE:", buildAgentContext(profile),
    "PERSISTED RECENT EVENTS:", events.slice(0, 12).map((e) => `- [${e.phase}] ${e.type}: ${e.title}${e.detail ? ` — ${e.detail}` : ""}`).join("\n") || "none yet",
    "PERSISTED RECENT TASKS:", tasks.slice(0, 12).map((t) => `- [${t.phase}] ${t.status}: ${t.title}${t.completedAt ? ` — completed ${t.completedAt.toISOString()}` : ""}`).join("\n") || "none yet",
    "CANONICAL STAGE POLICIES:", JSON.stringify(STAGE_POLICIES),
  ].join("\n\n");
  const raw = await generateText({ messages: [{ role: "system", content: prompt }], timeoutMs: 25_000, jsonMode: true });
  let intelligence: unknown;
  try {
    intelligence = parseModelJson(raw);
  } catch {
    throw new AIRuntimeError("AI_INVALID_RESPONSE", "Journey intelligence returned invalid JSON.", 502);
  }
  return { currentPhase: normalizePhase(profile.currentPhase), generatedAt: new Date().toISOString(), intelligence };
}
