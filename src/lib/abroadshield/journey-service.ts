import { db } from "@/lib/db";
import { generateText, AIRuntimeError } from "./ai-runtime";
import { buildAgentContext, type AgentProfile } from "./task-context";
import { normalizePhase } from "./journey";
import { STAGE_POLICIES } from "./stage-orchestrator";
import { parseModelJson } from "./parse-json";
import type { JourneyProfileViewModel, JourneyWorkspaceViewModel } from "./types/view-models";

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

function toProfileViewModel(profile: Awaited<ReturnType<typeof db.journeyProfile.findUnique>>, user: { name: string | null; email: string | null }): JourneyProfileViewModel {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    origin: profile?.origin ?? "",
    destination: profile?.destination ?? "",
    course: profile?.course ?? "",
    university: profile?.university ?? "",
    preferredUniversities: profile?.preferredUniversities ?? "",
    careerGoal: profile?.careerGoal ?? "",
    intake: profile?.intake ?? "",
    currentPhase: normalizePhase(profile?.currentPhase),
    readiness: profile?.documentsTotal ? Math.round((profile.documentsVerified / Math.max(profile.documentsTotal, 1)) * 100) : profile?.readiness ?? 0,
    onboarded: profile?.onboarded ?? false,
    documentsTotal: profile?.documentsTotal ?? 0,
    documentsVerified: profile?.documentsVerified ?? 0,
    visaAppointment: profile?.visaAppointment ?? undefined,
    funding: profile?.funding ?? undefined,
    homeLanguage: profile?.homeLanguage ?? undefined,
  };
}

export async function getJourneyWorkspaceData(userId: string): Promise<JourneyWorkspaceViewModel | null> {
  const [user, profile, events, tasks] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    db.journeyProfile.findUnique({ where: { userId } }),
    db.journeyEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50, select: { phase: true, type: true, title: true, detail: true, createdAt: true } }),
    db.journeyTask.findMany({ where: { userId }, orderBy: [{ status: "asc" }, { dueAt: "asc" }], take: 100, select: { id: true, phase: true, type: true, title: true, status: true, priority: true, dueAt: true, completedAt: true } }),
  ]);
  if (!user) return null;
  return {
    profile: toProfileViewModel(profile, user),
    events: events.map((event) => ({ phase: normalizePhase(event.phase), type: event.type, title: event.title, detail: event.detail, createdAt: event.createdAt.toISOString() })),
    tasks: tasks.map((task) => ({ id: task.id, phase: normalizePhase(task.phase), type: task.type, title: task.title, status: task.status, priority: task.priority, dueAt: task.dueAt?.toISOString() ?? null, completedAt: task.completedAt?.toISOString() ?? null })),
  };
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

export async function updateJourneyProfile(userId: string, input: JourneyProfileInput): Promise<JourneyProfileViewModel> {
  const data = sanitizeJourneyProfile(input);
  const previous = await db.journeyProfile.findUnique({ where: { userId } });
  const profile = await db.journeyProfile.upsert({ where: { userId }, update: data, create: { userId, ...data } });
  const phaseChanged = previous ? previous.currentPhase !== profile.currentPhase : false;
  await db.journeyEvent.create({ data: { userId, phase: profile.currentPhase, type: phaseChanged ? "phase_changed" : "profile_updated", title: phaseChanged ? `Moved to ${profile.currentPhase}` : "Journey profile updated", detail: "Journey strategy saved to the persistent record." } });
  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  return toProfileViewModel(profile, user ?? { name: null, email: null });
}

export async function generateJourneyIntelligence(userId: string) {
  const profile = await getAgentProfile(userId);
  if (!profile) return null;
  const workspace = await getJourneyWorkspaceData(userId);
  if (!workspace) return null;
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
    "PERSISTED RECENT EVENTS:", workspace.events.slice(0, 12).map((e) => `- [${e.phase}] ${e.type}: ${e.title}${e.detail ? ` — ${e.detail}` : ""}`).join("\n") || "none yet",
    "PERSISTED RECENT TASKS:", workspace.tasks.slice(0, 12).map((t) => `- [${t.phase}] ${t.status}: ${t.title}${t.completedAt ? ` — completed ${t.completedAt}` : ""}`).join("\n") || "none yet",
    "CANONICAL STAGE POLICIES:", JSON.stringify(STAGE_POLICIES),
  ].join("\n\n");
  const raw = await generateText({ messages: [{ role: "system", content: prompt }], timeoutMs: 25_000, jsonMode: true });
  let intelligence: unknown;
  try { intelligence = parseModelJson(raw); } catch { throw new AIRuntimeError("AI_INVALID_RESPONSE", "Journey intelligence returned invalid JSON.", 502); }
  return { currentPhase: normalizePhase(profile.currentPhase), generatedAt: new Date().toISOString(), intelligence };
}
