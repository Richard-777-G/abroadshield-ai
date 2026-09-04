import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { normalizePhase } from "@/lib/abroadshield/journey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const profileFields = ["origin", "destination", "course", "university", "preferredUniversities", "careerGoal", "intake", "currentPhase", "readiness", "onboarded", "documentsTotal", "documentsVerified", "visaAppointment", "funding", "homeLanguage"] as const;
type ProfileInput = Partial<Record<(typeof profileFields)[number], string | number | boolean | null>>;

function sanitize(input: ProfileInput) {
  const out: Record<string, string | number | boolean | null> = {};
  for (const key of profileFields) if (input[key] !== undefined) out[key] = input[key] ?? null;
  if (typeof out.currentPhase === "string") out.currentPhase = normalizePhase(out.currentPhase);
  for (const key of ["readiness", "documentsTotal", "documentsVerified"]) if (out[key] !== undefined) out[key] = Math.max(0, Number(out[key]) || 0);
  return out;
}

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
    const profile = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const events = await db.journeyEvent.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
    const tasks = await db.journeyTask.findMany({ where: { userId: user.id }, orderBy: [{ status: "asc" }, { dueAt: "asc" }], take: 100 });
    return NextResponse.json({ ok: true, profile, events, tasks });
  } catch (error) {
    console.error("[abroadshield/journey GET]", error);
    return NextResponse.json({ ok: false, error: "Could not load journey." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await resolveUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const input = sanitize((await req.json().catch(() => ({}))) as ProfileInput);
    const previous = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const profile = await db.journeyProfile.upsert({ where: { userId: user.id }, update: input, create: { userId: user.id, ...input } });
    const phaseChanged = previous && previous.currentPhase !== profile.currentPhase;
    await db.journeyEvent.create({ data: { userId: user.id, phase: profile.currentPhase, type: phaseChanged ? "phase_changed" : "profile_updated", title: phaseChanged ? `Moved to ${profile.currentPhase}` : "Journey profile updated", detail: "Journey state saved to the persistent record." } });
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[abroadshield/journey PUT]", error);
    return NextResponse.json({ ok: false, error: "Could not save journey." }, { status: 500 });
  }
}
