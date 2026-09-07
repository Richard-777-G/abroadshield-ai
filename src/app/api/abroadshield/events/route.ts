import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/abroadshield/authenticated-user";
import { listJourneyEvents, recordJourneyEvent } from "@/lib/abroadshield/journey-event-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const events = await listJourneyEvents(userId);
    return NextResponse.json({ ok: true, events });
  } catch (error) {
    console.error("[abroadshield/events GET]", error);
    return NextResponse.json({ ok: false, error: "Could not load journey events." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const event = await recordJourneyEvent(userId, body);
    return NextResponse.json({ ok: true, event });
  } catch (error) {
    console.error("[abroadshield/events POST]", error);
    return NextResponse.json({ ok: false, error: "Could not record journey event." }, { status: 500 });
  }
}
