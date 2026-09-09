import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/abroadshield/authenticated-user";
import {
  saveOpportunity,
  listSavedOpportunities,
} from "@/lib/abroadshield/opportunity-service";
import type { Opportunity } from "@/lib/abroadshield/opportunity-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const opportunity = body.opportunity as Opportunity | undefined;

    if (!opportunity || !opportunity.canonicalId || !opportunity.title) {
      return NextResponse.json(
        { ok: false, error: "Invalid opportunity data provided." },
        { status: 400 },
      );
    }

    const result = await saveOpportunity(user.id, opportunity);
    return NextResponse.json({
      ok: true,
      savedId: result.savedId,
      alreadySaved: result.alreadySaved,
      message: result.alreadySaved
        ? "Opportunity was already saved to your journey."
        : "Opportunity successfully saved to your journey.",
    });
  } catch (error) {
    console.error("[opportunities/save] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save opportunity to journey." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 },
      );
    }

    const savedOpportunities = await listSavedOpportunities(user.id);
    return NextResponse.json({
      ok: true,
      savedOpportunities,
      total: savedOpportunities.length,
    });
  } catch (error) {
    console.error("[opportunities/save] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to retrieve saved opportunities." },
      { status: 500 },
    );
  }
}
