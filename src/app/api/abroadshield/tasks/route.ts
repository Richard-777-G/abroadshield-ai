import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/abroadshield/authenticated-user";
import { executeAgentTask, taskErrorResponseMessage } from "@/lib/abroadshield/task-executor";
import { getAgentProfile } from "@/lib/abroadshield/journey-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as { taskType?: string; context?: string; phase?: string; mode?: "execute" | "plan" };
    const profile = await getAgentProfile(user.id);
    if (!profile) return NextResponse.json({ ok: false, error: "Journey profile not found." }, { status: 404 });
    const result = await executeAgentTask(user.id, profile, { taskType: body.taskType ?? "", context: body.context, phase: body.phase, mode: body.mode });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[abroadshield/tasks] error", error);
    const { message, status } = taskErrorResponseMessage(error);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
