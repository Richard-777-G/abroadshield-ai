import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getDashboardSnapshot } from "@/lib/abroadshield/dashboard-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const snapshot = await getDashboardSnapshot(userId);
    if (!snapshot) return NextResponse.json({ ok: false, error: "Dashboard profile not found." }, { status: 404 });
    return NextResponse.json({ ok: true, snapshot });
  } catch (error) {
    console.error("[abroadshield/dashboard GET]", error);
    return NextResponse.json({ ok: false, error: "Could not build dashboard." }, { status: 500 });
  }
}
