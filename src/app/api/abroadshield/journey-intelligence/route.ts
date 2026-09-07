import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { AIRuntimeError } from "@/lib/abroadshield/ai-runtime";
import { generateJourneyIntelligence } from "@/lib/abroadshield/journey-service";

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

async function handle() {
  const userId = await resolveUserId();
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
