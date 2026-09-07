import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { getJourneyWorkspaceData, updateJourneyProfile } from "@/lib/abroadshield/journey-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUser() {
  const session = await getServerSession();
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!sessionUserId && !email) return null;
  if (sessionUserId) return db.user.upsert({ where: { id: sessionUserId }, update: { name: session?.user?.name ?? undefined, email: email ?? undefined }, create: { id: sessionUserId, email: email || `${sessionUserId}@local.invalid`, name: session?.user?.name ?? undefined } });
  return db.user.upsert({ where: { email: email! }, update: { name: session?.user?.name ?? undefined }, create: { email: email!, name: session?.user?.name ?? undefined } });
}

export async function GET() {
  try {
    const user = await resolveUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const workspace = await getJourneyWorkspaceData(user.id);
    if (!workspace) return NextResponse.json({ ok: false, error: "Journey not found." }, { status: 404 });
    return NextResponse.json({ ok: true, ...workspace });
  } catch (error) {
    console.error("[abroadshield/journey GET]", error);
    return NextResponse.json({ ok: false, error: "Could not load journey." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await resolveUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const input = (await req.json().catch(() => ({}))) as Record<string, string | number | boolean | null>;
    const profile = await updateJourneyProfile(user.id, input);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[abroadshield/journey PUT]", error);
    return NextResponse.json({ ok: false, error: "Could not save journey." }, { status: 500 });
  }
}
