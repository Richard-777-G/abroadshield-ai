import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/abroadshield/authenticated-user";
import { AIRuntimeError } from "@/lib/abroadshield/ai-runtime";
import { generateJourneyIntelligence } from "@/lib/abroadshield/journey-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
  const result = await generateJourneyIntelligence(userId);
  if (!result) return NextResponse.json({ ok: false, error: "Profile not found." }, { status: 404 });
  return NextResponse.json({ ok: true, ...result });
}

export async function GET() {
  try { return await handle(); }
  catch (error) {
    console.error("[abroadshield/journey-intelligence GET]", error);
    if (error instanceof AIRuntimeError) return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    return NextResponse.json({ ok: false, error: "Unable to generate journey intelligence." }, { status: 500 });
  }
}

export async function POST() {
  try { return await handle(); }
  catch (error) {
    console.error("[abroadshield/journey-intelligence POST]", error);
    if (error instanceof AIRuntimeError) return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    return NextResponse.json({ ok: false, error: "Unable to generate journey intelligence." }, { status: 500 });
  }
}
