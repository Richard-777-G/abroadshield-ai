import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/abroadshield/authenticated-user";
import { getJourneyWorkspaceData, updateJourneyProfile } from "@/lib/abroadshield/journey-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const workspace = await getJourneyWorkspaceData(user.id);
    if (!workspace) {
      return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, profile: workspace.profile });
  } catch (error) {
    console.error("[abroadshield/profile GET]", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    // 1. Update user identity if name provided
    if (typeof body.name === "string" && body.name.trim()) {
      await db.user.update({
        where: { id: user.id },
        data: { name: body.name.trim() },
      });
    }

    // 2. Filter journey profile updates
    const allowedFields = [
      "origin",
      "destination",
      "course",
      "university",
      "preferredUniversities",
      "careerGoal",
      "intake",
      "currentPhase",
      "visaAppointment",
      "funding",
      "homeLanguage",
    ] as const;

    const journeyInput: Record<string, string | number | boolean | null> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        journeyInput[key] = typeof body[key] === "string" ? (body[key] as string).trim() : (body[key] as any);
      }
    }

    const updatedProfile = await updateJourneyProfile(user.id, journeyInput);

    return NextResponse.json({ ok: true, profile: updatedProfile });
  } catch (error) {
    console.error("[abroadshield/profile PATCH]", error);
    return NextResponse.json({ ok: false, error: "Failed to update profile." }, { status: 500 });
  }
}
