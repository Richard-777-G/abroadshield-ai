import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHAT_TIMEOUT_MS = 25_000;
type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_RULES = `You are AbroadShield AI, an agentic study-abroad execution assistant.
You work across four phases: Pre-Departure, Arrival, Studying & Part-Time, and Job Success.
Use the student's persistent journey record as the source of truth. The selected/current phase matters, but the agent remembers the whole journey.
Act instead of merely advising when a real tool or artifact is available. Never claim an external action happened unless the application actually executed it. Never fabricate live jobs, listings, deadlines, URLs, legal requirements, or connector state. If live data or a connector is unavailable, say so clearly and give the next executable step.
For emails and outbound communications, draft first and require explicit approval before sending. For visa/legal matters, distinguish general guidance from official advice and point to the relevant official authority.
Keep responses concise, practical and professional.
`;

async function resolveUser() {
  const session = await getServerSession().catch(() => null);
  const id = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!id && !email) return null;
  const user = id
    ? await db.user.upsert({ where: { id }, update: { name: session?.user?.name ?? undefined, email: email ?? undefined }, create: { id, email: email || `${id}@local.invalid`, name: session?.user?.name ?? undefined } })
    : await db.user.upsert({ where: { email: email! }, update: { name: session?.user?.name ?? undefined }, create: { email: email!, name: session?.user?.name ?? undefined } });
  return { user, session };
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("AGENT_TIMEOUT")), ms);
  });
  try { return await Promise.race([promise, timeout]); }
  finally { if (timer) clearTimeout(timer); }
}

export async function POST(req: NextRequest) {
  try {
    const resolved = await resolveUser();
    if (!resolved) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const userMessage = typeof body.message === "string" ? body.message : messages.find((m) => m.role === "user")?.content ?? "";
    if (!userMessage.trim()) return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });

    const journey = await db.journeyProfile.findUnique({ where: { userId: resolved.user.id } });
    const [recentEvents, recentTasks] = await Promise.all([
      db.journeyEvent.findMany({ where: { userId: resolved.user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
      db.journeyTask.findMany({ where: { userId: resolved.user.id }, orderBy: { updatedAt: "desc" }, take: 8 }),
    ]);
    const profile: AgentProfile = {
      name: journey?.userId ? resolved.user.name ?? resolved.session?.user?.name ?? undefined : resolved.session?.user?.name ?? undefined,
      email: resolved.user.email,
      origin: journey?.origin,
      destination: journey?.destination,
      course: journey?.course,
      university: journey?.university,
      intake: journey?.intake,
      currentPhase: journey?.currentPhase,
      documentsTotal: journey?.documentsTotal,
      documentsVerified: journey?.documentsVerified,
      visaAppointment: journey?.visaAppointment ?? undefined,
      funding: journey?.funding ?? undefined,
      homeLanguage: journey?.homeLanguage ?? undefined,
    };
    const memory = `\nPERSISTENT JOURNEY:\n${buildAgentContext(profile)}\nRECENT EVENTS:\n${recentEvents.map((e) => `- [${e.phase}] ${e.type}: ${e.title}${e.detail ? ` — ${e.detail}` : ""}`).join("\n") || "none yet"}\nRECENT TASKS:\n${recentTasks.map((t) => `- [${t.phase}] ${t.status}: ${t.title}`).join("\n") || "none yet"}`;
    const history = messages.slice(-6).map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
    const zai = await withTimeout(ZAI.create(), 8_000);
    const completion = await withTimeout(
      zai.chat.completions.create({ messages: [{ role: "assistant", content: SYSTEM_RULES + memory }, ...history, { role: "user", content: userMessage }], thinking: { type: "disabled" } }),
      CHAT_TIMEOUT_MS,
    );
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) return NextResponse.json({ ok: false, error: "The agent returned an empty result." }, { status: 502 });
    await db.agentMessage.createMany({ data: [{ userId: resolved.user.id, role: "user", content: userMessage, phase: journey?.currentPhase || "pre-departure" }, { userId: resolved.user.id, role: "assistant", content: reply, phase: journey?.currentPhase || "pre-departure" }] });
    return NextResponse.json({ ok: true, reply, phase: journey?.currentPhase || "pre-departure" });
  } catch (error) {
    console.error("[abroadshield/chat] error", error);
    if (error instanceof Error && error.message === "AGENT_TIMEOUT") return NextResponse.json({ ok: false, error: "The agent took too long to respond. Please retry." }, { status: 504 });
    return NextResponse.json({ ok: false, error: "The agent hit an error. Please try again." }, { status: 500 });
  }
}
