import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";
import { normalizePhase } from "@/lib/abroadshield/journey";
import { STAGE_POLICIES } from "@/lib/abroadshield/stage-orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function generateIntelligence() {
  const session = await getServerSession();
  const sessionId = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!sessionId && !email) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });

  const user = sessionId
    ? await db.user.findUnique({ where: { id: sessionId } })
    : await db.user.findUnique({ where: { email: email! } });
  if (!user) return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });

  const journey = await db.journeyProfile.findUnique({ where: { userId: user.id } });
  const currentPhase = normalizePhase(journey?.currentPhase);
  const [recentEvents, recentTasks] = await Promise.all([
    db.journeyEvent.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 12 }),
    db.journeyTask.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 12 }),
  ]);

  const profile: AgentProfile = {
    name: user.name ?? undefined,
    email: user.email,
    origin: journey?.origin,
    destination: journey?.destination,
    course: journey?.course,
    university: journey?.university,
    intake: journey?.intake,
    currentPhase,
    documentsTotal: journey?.documentsTotal,
    documentsVerified: journey?.documentsVerified,
    visaAppointment: journey?.visaAppointment ?? undefined,
    funding: journey?.funding ?? undefined,
    homeLanguage: journey?.homeLanguage ?? undefined,
  };

  const prompt = [
    "You are AbroadShield AI's Journey Intelligence layer.",
    "Build an explainable, student-specific four-stage strategy from the authenticated profile and persisted journey history.",
    "Do not invent facts. Surface missing information explicitly.",
    "Current stage gets immediate priorities; future stages get preparation guidance.",
    "For every stage provide objective, whyItMatters, abroadShieldWill, studentWill, prerequisites, risks, firstActions.",
    "Also provide studentSummary, careerDirection, biggestUnknowns, next90Days.",
    "Use persisted events and tasks to avoid recommending work already completed unless it needs follow-up.",
    "Return valid JSON only.",
    "PROFILE:",
    buildAgentContext(profile),
    "PERSISTED RECENT EVENTS:",
    recentEvents.map((e) => `- [${e.phase}] ${e.type}: ${e.title}${e.detail ? ` — ${e.detail}` : ""}`).join("\n") || "none yet",
    "PERSISTED RECENT TASKS:",
    recentTasks.map((t) => `- [${t.phase}] ${t.status}: ${t.title}${t.completedAt ? ` — completed ${t.completedAt.toISOString()}` : ""}`).join("\n") || "none yet",
    "CANONICAL STAGE POLICIES:",
    JSON.stringify(STAGE_POLICIES),
  ].join("\n\n");

  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: [{ role: "assistant", content: prompt }],
    thinking: { type: "disabled" },
  });
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!raw) throw new Error("Journey intelligence returned an empty response.");

  let intelligence: unknown;
  try {
    intelligence = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Journey intelligence returned invalid JSON." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, currentPhase, generatedAt: new Date().toISOString(), intelligence });
}

export async function GET() {
  try {
    return await generateIntelligence();
  } catch (error) {
    console.error("[abroadshield/journey-intelligence GET]", error);
    return NextResponse.json({ ok: false, error: "Unable to generate journey intelligence." }, { status: 500 });
  }
}

export async function POST() {
  try {
    return await generateIntelligence();
  } catch (error) {
    console.error("[abroadshield/journey-intelligence POST]", error);
    return NextResponse.json({ ok: false, error: "Unable to generate journey intelligence." }, { status: 500 });
  }
}
