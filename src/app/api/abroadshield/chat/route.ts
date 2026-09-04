import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { generateText, AIRuntimeError } from "@/lib/abroadshield/ai-runtime";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";
import { detectCapability } from "@/lib/abroadshield/capability-router";
import { buildStageSystemDirective, buildWholeJourneyDirective, getStagePolicy, isCapabilityAllowedInStage, isExplorationRequest } from "@/lib/abroadshield/stage-orchestrator";
import { normalizePhase } from "@/lib/abroadshield/journey";
import { executeAgentTask } from "@/lib/abroadshield/task-executor";
import type { AgentCapability } from "@/lib/abroadshield/tool-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_RULES = `You are AbroadShield AI, an agentic study-abroad execution assistant.
You operate as a stage-specialized system, not a generic assistant. The active journey stage determines the current mission, priorities and allowed execution capabilities.
Use the student's persistent journey record as the source of truth. The agent remembers the whole journey, but it must prioritize the active stage.
The student can inspect, understand and plan any stage of the journey at any time. Do not treat future-stage exploration as a request to execute that stage's tools.
Act instead of merely advising when a permitted real tool or artifact is available. Never claim an external action happened unless the application actually executed it. Never fabricate live jobs, listings, deadlines, URLs, legal requirements, or connector state. If live data or a connector is unavailable, say so clearly and give the next executable step.
For emails and outbound communications, draft first and require explicit approval before sending. For visa/legal matters, distinguish general guidance from official advice and point to the relevant official authority.
Keep responses concise, practical and professional.`;

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

export async function POST(req: NextRequest) {
  try {
    const resolved = await resolveUser();
    if (!resolved) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const userMessage = typeof body.message === "string" ? body.message : messages.find((m) => m.role === "user")?.content ?? "";
    if (!userMessage.trim()) return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });

    const journey = await db.journeyProfile.findUnique({ where: { userId: resolved.user.id } });
    const phase = normalizePhase(journey?.currentPhase);
    const policy = getStagePolicy(phase);
    const capability = detectCapability(userMessage) as AgentCapability | null;
    const exploring = isExplorationRequest(userMessage);

    if (capability && !isCapabilityAllowedInStage(phase, capability) && !exploring) {
      const reply = `That action belongs to a different journey stage. You are currently in ${policy.title}. You can still explore that future stage with me; to execute an action, make the relevant stage active first.`;
      await db.agentMessage.createMany({ data: [
        { userId: resolved.user.id, role: "user", content: userMessage, phase },
        { userId: resolved.user.id, role: "assistant", content: reply, phase },
      ] });
      return NextResponse.json({ ok: true, reply, phase, capability, executed: false, stageBlocked: true });
    }

    if (capability && !exploring && isCapabilityAllowedInStage(phase, capability)) {
      const profile: AgentProfile = {
        name: resolved.user.name ?? resolved.session?.user?.name ?? undefined,
        email: resolved.user.email,
        origin: journey?.origin,
        destination: journey?.destination,
        course: journey?.course,
        university: journey?.university,
        intake: journey?.intake,
        currentPhase: phase,
        documentsTotal: journey?.documentsTotal,
        documentsVerified: journey?.documentsVerified,
        visaAppointment: journey?.visaAppointment ?? undefined,
        funding: journey?.funding ?? undefined,
        homeLanguage: journey?.homeLanguage ?? undefined,
      };
      const taskResult = await executeAgentTask(resolved.user.id, profile, { taskType: capability, context: userMessage, phase, mode: "execute" });
      const reply = summarizeTask(capability, taskResult.result);
      await db.agentMessage.createMany({ data: [
        { userId: resolved.user.id, role: "user", content: userMessage, phase },
        { userId: resolved.user.id, role: "assistant", content: reply, phase },
      ] });
      return NextResponse.json({ ok: true, reply, phase, capability, taskId: taskResult.taskId, result: taskResult.result, executed: true });
    }

    const [recentEvents, recentTasks] = await Promise.all([
      db.journeyEvent.findMany({ where: { userId: resolved.user.id }, orderBy: { createdAt: "desc" }, take: 8 }),
      db.journeyTask.findMany({ where: { userId: resolved.user.id }, orderBy: { updatedAt: "desc" }, take: 8 }),
    ]);
    const profile: AgentProfile = {
      name: resolved.user.name ?? resolved.session?.user?.name ?? undefined, email: resolved.user.email,
      origin: journey?.origin, destination: journey?.destination, course: journey?.course, university: journey?.university,
      intake: journey?.intake, currentPhase: phase, documentsTotal: journey?.documentsTotal,
      documentsVerified: journey?.documentsVerified, visaAppointment: journey?.visaAppointment ?? undefined,
      funding: journey?.funding ?? undefined, homeLanguage: journey?.homeLanguage ?? undefined,
    };
    const memory = `PERSISTENT JOURNEY:\n${buildAgentContext(profile)}\nACTIVE STAGE POLICY:\n${buildStageSystemDirective(phase)}\nWHOLE JOURNEY POLICY:\n${buildWholeJourneyDirective(phase)}\nRECENT EVENTS:\n${recentEvents.map((e) => `- [${e.phase}] ${e.type}: ${e.title}${e.detail ? ` — ${e.detail}` : ""}`).join("\n") || "none yet"}\nRECENT TASKS:\n${recentTasks.map((t) => `- [${t.phase}] ${t.status}: ${t.title}`).join("\n") || "none yet"}`;
    const history = messages.slice(-6).map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
    const reply = await generateText({ messages: [{ role: "system", content: SYSTEM_RULES + "\n\n" + memory }, ...history, { role: "user", content: userMessage }], timeoutMs: 25_000 });
    await db.agentMessage.createMany({ data: [
      { userId: resolved.user.id, role: "user", content: userMessage, phase },
      { userId: resolved.user.id, role: "assistant", content: reply, phase },
    ] });
    return NextResponse.json({ ok: true, reply, phase, executed: false });
  } catch (error) {
    console.error("[abroadshield/chat] error", error);
    if (error instanceof AIRuntimeError) return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    return NextResponse.json({ ok: false, error: "The agent hit an unexpected error. Please try again." }, { status: 500 });
  }
}
