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
    if (!snapshot) return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
    return NextResponse.json({ ok: true, snapshot: snapshot.requirements });
  } catch (error) {
    console.error("[abroadshield/requirements]", error);
    return NextResponse.json({ ok: false, error: "Could not build requirements." }, { status: 500 });
  }
}
