import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";
import { normalizePhase } from "@/lib/abroadshield/journey";
import { STAGE_POLICIES } from "@/lib/abroadshield/stage-orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    const sessionId = (session?.user as { id?: string } | undefined)?.id;
    const email = session?.user?.email;
    if (!sessionId && !email) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const user = sessionId ? await db.user.findUnique({ where: { id: sessionId } }) : await db.user.findUnique({ where: { email: email! } });
    if (!user) return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
    const journey = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const currentPhase = normalizePhase(journey?.currentPhase);
    const profile: AgentProfile = { name: user.name ?? undefined, email: user.email, origin: journey?.origin, destination: journey?.destination, course: journey?.course, university: journey?.university, intake: journey?.intake, currentPhase, documentsTotal: journey?.documentsTotal, documentsVerified: journey?.documentsVerified, visaAppointment: journey?.visaAppointment ?? undefined, funding: journey?.funding ?? undefined, homeLanguage: journey?.homeLanguage ?? undefined };
    const prompt = ["You are AbroadShield AI's Journey Intelligence layer.","Build an explainable, student-specific four-stage strategy from the authenticated profile.","Do not invent facts. Surface missing information explicitly.","Current stage gets immediate priorities; future stages get preparation guidance.","For every stage provide objective, whyItMatters, abroadShieldWill, studentWill, prerequisites, risks, firstActions.","Also provide studentSummary, careerDirection, biggestUnknowns, next90Days.","Return valid JSON only.","PROFILE:",buildAgentContext(profile),"CANONICAL STAGE POLICIES:",JSON.stringify(STAGE_POLICIES)].join("\n\n");
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({ messages: [{ role: "assistant", content: prompt }], thinking: { type: "disabled" } });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) throw new Error("Journey intelligence returned an empty response.");
    let intelligence: unknown;
    try { intelligence = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "Journey intelligence returned invalid JSON." }, { status: 502 }); }
    return NextResponse.json({ ok: true, currentPhase, generatedAt: new Date().toISOString(), intelligence });
  } catch (error) {
    console.error("[abroadshield/journey-intelligence]", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not analyze the journey." }, { status: 500 });
  }
}
