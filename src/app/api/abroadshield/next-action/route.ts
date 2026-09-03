import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { normalizePhase } from "@/lib/abroadshield/journey";
import { getStagePolicy } from "@/lib/abroadshield/stage-orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    const id = (session?.user as { id?: string } | undefined)?.id;
    const email = session?.user?.email;
    if (!id && !email) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });

    const user = id ? await db.user.findUnique({ where: { id } }) : await db.user.findUnique({ where: { email: email! } });
    if (!user) return NextResponse.json({ ok: false, error: "Journey profile not found." }, { status: 404 });

    const profile = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const phase = normalizePhase(profile?.currentPhase);
    const policy = getStagePolicy(phase);

    const active = await db.journeyTask.findMany({
      where: { userId: user.id, phase, status: { in: ["queued", "running"] } },
      orderBy: [{ priority: "asc" }, { dueAt: "asc" }, { createdAt: "asc" }], take: 10,
    });
    const completed = await db.journeyTask.count({ where: { userId: user.id, phase, status: "completed" } });
    const recentCompleted = await db.journeyTask.findMany({
      where: { userId: user.id, phase, status: "completed" },
      orderBy: { completedAt: "desc" }, take: 3,
      select: { title: true, type: true, completedAt: true },
    });
    const next = active[0] ?? null;
    const readiness = profile?.documentsTotal ? Math.round((profile.documentsVerified / Math.max(profile.documentsTotal, 1)) * 100) : profile?.readiness ?? 0;
    const fallback = !next ? { type: policy.capabilities[0], title: phase === "pre-departure" ? "Review your next pre-departure action" : `Review your next ${policy.title.toLowerCase()} action`, reason: policy.objective, capability: policy.capabilities[0] } : null;

    return NextResponse.json({
      ok: true, phase, stage: policy.title, readiness,
      next: next ? { id: next.id, type: next.type, title: next.title, status: next.status, priority: next.priority, dueAt: next.dueAt, result: next.result } : fallback,
      activeCount: active.length, completedCount: completed,
      recentCompleted: recentCompleted.map((task) => ({ title: task.title, type: task.type, completedAt: task.completedAt })),
      allowedCapabilities: policy.capabilities,
    });
  } catch (error) {
    console.error("[abroadshield/next-action GET]", error);
    return NextResponse.json({ ok: false, error: "Could not determine next action." }, { status: 500 });
  }
}
