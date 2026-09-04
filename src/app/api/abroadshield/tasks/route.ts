import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { executeAgentTask, taskErrorResponseMessage } from "@/lib/abroadshield/task-executor";
import type { AgentProfile } from "@/lib/abroadshield/task-context";

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

export async function POST(req: Request) {
  try {
    const user = await resolveUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as {
      taskType?: string;
      context?: string;
      phase?: string;
      mode?: "execute" | "plan";
    };

    const journey = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const profile: AgentProfile = {
      name: user.name ?? undefined,
      email: user.email,
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

    const result = await executeAgentTask(user.id, profile, {
      taskType: body.taskType ?? "",
      context: body.context,
      phase: body.phase,
      mode: body.mode,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[abroadshield/tasks] error", error);
    const { message, status } = taskErrorResponseMessage(error);
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
