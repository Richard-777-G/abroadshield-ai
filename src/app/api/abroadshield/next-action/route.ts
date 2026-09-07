import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/abroadshield/authenticated-user";
import { getJourneyApplicationSnapshot } from "@/lib/abroadshield/journey-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });

    const snapshot = await getJourneyApplicationSnapshot(userId);
    if (!snapshot) return NextResponse.json({ ok: false, error: "Journey profile not found." }, { status: 404 });

    return NextResponse.json({
      ok: true,
      phase: snapshot.phase,
      stage: snapshot.policy.title,
      readiness: snapshot.readiness,
      next: snapshot.next
        ? { id: snapshot.next.id, type: snapshot.next.type, title: snapshot.next.title, status: snapshot.next.status, priority: snapshot.next.priority, dueAt: snapshot.next.dueAt, result: snapshot.next.result }
        : snapshot.fallback,
      activeCount: snapshot.activeCount,
      blockedCount: snapshot.blockedCount,
      completedCount: snapshot.completedCount,
      blocked: snapshot.blocked.map((task) => ({ id: task.id, type: task.type, title: task.title, status: task.status, priority: task.priority, dueAt: task.dueAt, result: task.result, createdAt: task.createdAt })),
      recentCompleted: snapshot.recentCompleted.map((task) => ({ title: task.title, type: task.type, completedAt: task.completedAt })),
      allowedCapabilities: snapshot.policy.capabilities,
    });
  } catch (error) {
    console.error("[abroadshield/next-action GET]", error);
    return NextResponse.json({ ok: false, error: "Could not determine next action." }, { status: 500 });
  }
}
