import { NextResponse } from "next/server";
import { getJourneyApplicationSnapshot } from "@/lib/abroadshield/journey-query";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUserId() {
  const session = await getServerSession();
  const id = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!id && !email) return null;
  const user = id
    ? await db.user.findUnique({ where: { id }, select: { id: true } })
    : await db.user.findUnique({ where: { email: email! }, select: { id: true } });
  return user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const snapshot = await getJourneyApplicationSnapshot(userId);
    if (!snapshot) return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ ok: true, snapshot: snapshot.requirements });
  } catch (error) {
    console.error("[abroadshield/requirements]", error);
    return NextResponse.json({ ok: false, error: "Could not build requirements." }, { status: 500 });
  }
}
