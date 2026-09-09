import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/abroadshield/authenticated-user";
import { prepareOpportunityApplication } from "@/lib/abroadshield/opportunity-service";
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

    const plan = await prepareOpportunityApplication(user.id, opportunity);
    return NextResponse.json({
      ok: true,
      plan,
    });
  } catch (error) {
    console.error("[opportunities/prepare] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate application preparation plan." },
      { status: 500 },
    );
  }
}
