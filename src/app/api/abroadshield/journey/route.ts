import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/abroadshield/authenticated-user";
import { getJourneyWorkspaceData, updateJourneyProfile } from "@/lib/abroadshield/journey-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
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
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const input = (await req.json().catch(() => ({}))) as Record<string, string | number | boolean | null>;
    const profile = await updateJourneyProfile(user.id, input);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[abroadshield/journey PUT]", error);
    return NextResponse.json({ ok: false, error: "Could not save journey." }, { status: 500 });
  }
}
