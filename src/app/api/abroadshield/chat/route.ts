import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";
import { detectCapability } from "@/lib/abroadshield/capability-router";

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
  const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("AGENT_TIMEOUT")), ms); });
  try { return await Promise.race([promise, timeout]); }
  finally { if (timer) clearTimeout(timer); }
}

function summarizeTask(capability: string, result: unknown): string {
  const label = capability.replaceAll("_", " ");
  if (!result || typeof result !== "object") return `I completed the ${label} task and recorded the result in your journey.`;
  const data = result as Record<string, unknown>;
  const lines: string[] = [];
  if (typeof data.summary === "string") lines.push(data.summary);
  if (typeof data.status === "string") lines.push(`Status: ${data.status}`);
  if (Array.isArray(data.issues)) {
    const issues = data.issues.filter((x): x is string => typeof x === "string");
    if (issues.length) lines.push(`Issues: ${issues.join("; ")}`);
  }
  if (typeof data.nextAction === "string") lines.push(`Next: ${data.nextAction}`);
  return lines.join("\n") || `I completed the ${label} task and recorded the result in your journey.`;
}

async function executeTask(req: NextRequest, capability: string, message: string, phase: string) {
  const response = await fetch(new URL("/api/abroadshield/tasks", req.url), {
    method: "POST",
    headers: { "content-type": "application/json", cookie: req.headers.get("cookie") ?? "" },
    body: JSON.stringify({ taskType: capability, context: message, phase }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Task execution failed.");
  return payload;
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
    const phase = journey?.currentPhase || "pre-departure";
    const capability = detectCapability(userMessage);

    if (capability) {
      const taskPayload = await executeTask(req, capability, userMessage, phase);
      const reply = summarizeTask(capability, taskPayload.result);
      await db.agentMessage.createMany({ data: [
        { userId: resolved.user.id, role: "user", content: userMessage, phase },
        { userId: resolved.user.id, role: "assistant", content: reply, phase },
      ] });
      return NextResponse.json({ ok: true, reply, phase, capability, taskId: taskPayload.taskId, result: taskPayload.result, executed: true });
    }

    const [recentEvents, recentTasks] = await Promise.all([
      db.journeyEvent.findMany({ where: { userId: resolved.user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
      db.journeyTask.findMany({ where: { userId: resolved.user.id }, orderBy: { updatedAt: "desc" }, take: 8 }),
    ]);
    const profile: AgentProfile = {
      name: resolved.user.name ?? resolved.session?.user?.name ?? undefined, email: resolved.user.email,
      origin: journey?.origin, destination: journey?.destination, course: journey?.course, university: journey?.university,
      intake: journey?.intake, currentPhase: journey?.currentPhase, documentsTotal: journey?.documentsTotal,
      documentsVerified: journey?.documentsVerified, visaAppointment: journey?.visaAppointment ?? undefined,
      funding: journey?.funding ?? undefined, homeLanguage: journey?.homeLanguage ?? undefined,
    };
    const memory = `\nPERSISTENT JOURNEY:\n${buildAgentContext(profile)}\nRECENT EVENTS:\n${recentEvents.map((e) => `- [${e.phase}] ${e.type}: ${e.title}${e.detail ? ` — ${e.detail}` : ""}`).join("\n") || "none yet"}\nRECENT TASKS:\n${recentTasks.map((t) => `- [${t.phase}] ${t.status}: ${t.title}`).join("\n") || "none yet"}`;
    const history = messages.slice(-6).map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
    const zai = await withTimeout(ZAI.create(), 8_000);
    const completion = await withTimeout(zai.chat.completions.create({ messages: [{ role: "assistant", content: SYSTEM_RULES + memory }, ...history, { role: "user", content: userMessage }], thinking: { type: "disabled" } }), CHAT_TIMEOUT_MS);
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) return NextResponse.json({ ok: false, error: "The agent returned an empty result." }, { status: 502 });
    await db.agentMessage.createMany({ data: [{ userId: resolved.user.id, role: "user", content: userMessage, phase }, { userId: resolved.user.id, role: "assistant", content: reply, phase }] });
    return NextResponse.json({ ok: true, reply, phase, executed: false });
  } catch (error) {
    console.error("[abroadshield/chat] error", error);
    if (error instanceof Error && error.message === "AGENT_TIMEOUT") return NextResponse.json({ ok: false, error: "The agent took too long to respond. Please retry." }, { status: 504 });
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "The agent hit an error. Please try again." }, { status: 500 });
  }
}
