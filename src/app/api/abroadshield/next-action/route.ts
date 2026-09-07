import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { getDashboardSnapshot } from "@/lib/abroadshield/dashboard-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    const id = (session?.user as { id?: string } | undefined)?.id;
    const email = session?.user?.email;
    if (!id && !email) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });

    const user = id ? await db.user.findUnique({ where: { id }, select: { id: true } }) : await db.user.findUnique({ where: { email: email! }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, error: "Journey profile not found." }, { status: 404 });

    const snapshot = await getDashboardSnapshot(user.id);
    if (!snapshot) return NextResponse.json({ ok: false, error: "Journey profile not found." }, { status: 404 });

    return NextResponse.json({
      ok: true,
      phase: snapshot.phase.id,
      stage: snapshot.stage.title,
      readiness: snapshot.readiness,
      next: snapshot.next,
      activeCount: snapshot.activeCount,
      blockedCount: snapshot.blockedCount,
      completedCount: snapshot.completedCount,
      blocked: snapshot.blocked,
      recentCompleted: snapshot.recentCompleted,
      allowedCapabilities: snapshot.allowedCapabilities,
    });
  } catch (error) {
    console.error("[abroadshield/next-action GET]", error);
    return NextResponse.json({ ok: false, error: "Could not determine next action." }, { status: 500 });
  }
}
