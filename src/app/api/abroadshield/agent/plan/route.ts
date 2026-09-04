import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { executeAgentTask, taskErrorResponseMessage } from "@/lib/abroadshield/task-executor";
import type { AgentProfile } from "@/lib/abroadshield/task-context";
import { normalizePhase } from "@/lib/abroadshield/journey";
import { detectCapability } from "@/lib/abroadshield/capability-router";
import { getTool, type AgentCapability } from "@/lib/abroadshield/tool-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUser() {
  const session = await getServerSession();
  const id = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!id && !email) return null;
  return id
    ? db.user.upsert({
        where: { id },
        update: { name: session?.user?.name ?? undefined, email: email ?? undefined },
        create: { id, email: email || `${id}@local.invalid`, name: session?.user?.name ?? undefined },
      })
    : db.user.upsert({
        where: { email: email! },
        update: { name: session?.user?.name ?? undefined },
        create: { email: email!, name: session?.user?.name ?? undefined },
      });
}

function isCapability(value: unknown): value is AgentCapability {
  return typeof value === "string" && Boolean(getTool(value));
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as {
      taskType?: unknown;
      message?: unknown;
      context?: unknown;
      phase?: unknown;
      mode?: unknown;
    };

    const message = typeof body.message === "string" ? body.message.trim() : "";
    const context = typeof body.context === "string" ? body.context.trim() : "";
    const requestedTaskType = typeof body.taskType === "string" ? body.taskType : "";
    const taskType = isCapability(requestedTaskType) ? requestedTaskType : detectCapability(message || context);
    if (!taskType) {
      return NextResponse.json({ ok: false, error: "Could not determine the task type. Specify a supported capability or provide a more specific request." }, { status: 400 });
    }

    const request = context || message;
    if (!request) return NextResponse.json({ ok: false, error: "Message or context is required." }, { status: 400 });

    const journey = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const currentPhase = normalizePhase(journey?.currentPhase);
    const phase = typeof body.phase === "string" ? normalizePhase(body.phase) : currentPhase;
    const mode = body.mode === "plan" ? "plan" : "execute";

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

    const result = await executeAgentTask(user.id, profile, {
      taskType,
      context: request,
      phase,
      mode,
    });

    return NextResponse.json({
      ok: true,
      plan: {
        taskType: result.taskType,
        title: getTool(result.taskType)?.label ?? result.taskType,
        reason: mode === "plan" ? "Prepared through the canonical task executor." : "Executed through the canonical task executor.",
        context: request,
        requiresApproval: getTool(result.taskType)?.requiresApproval ?? false,
      },
      ...result,
    });
  } catch (error) {
    console.error("[abroadshield/agent/plan]", error);
    const { message, status } = taskErrorResponseMessage(error);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
