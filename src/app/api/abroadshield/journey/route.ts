import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { normalizePhase } from "@/lib/abroadshield/journey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const profileFields = ["name", "email", "origin", "destination", "course", "university", "intake", "currentPhase", "readiness", "onboarded", "documentsTotal", "documentsVerified", "visaAppointment", "funding", "homeLanguage"] as const;

type ProfileInput = Partial<Record<(typeof profileFields)[number], string | number | boolean | null>>;

function sanitize(input: ProfileInput) {
  const out: Record<string, string | number | boolean | null> = {};
  for (const key of profileFields) if (input[key] !== undefined) out[key] = input[key] ?? null;
  if (typeof out.currentPhase === "string") out.currentPhase = normalizePhase(out.currentPhase);
  for (const key of ["readiness", "documentsTotal", "documentsVerified"]) if (out[key] !== undefined) out[key] = Math.max(0, Number(out[key]) || 0);
  return out;
}

export async function GET() {
  try {
    const session = await getServerSession();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const email = session?.user?.email;
    if (!userId && !email) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const user = userId ? await db.user.findUnique({ where: { id: userId }, include: { journey: true } }) : await db.user.findUnique({ where: { email: email! }, include: { journey: true } });
    if (!user) return NextResponse.json({ ok: false, error: "Journey profile not found." }, { status: 404 });
    return NextResponse.json({ ok: true, profile: user.journey });
  } catch (error) {
    console.error("[abroadshield/journey GET]", error);
    return NextResponse.json({ ok: false, error: "Could not load journey." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    const sessionUserId = (session?.user as { id?: string } | undefined)?.id;
    const email = session?.user?.email;
    if (!sessionUserId && !email) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as ProfileInput;
    const input = sanitize(body);
    const user = sessionUserId
      ? await db.user.upsert({ where: { id: sessionUserId }, update: { name: typeof input.name === "string" ? input.name : undefined }, create: { id: sessionUserId, email: email || `${sessionUserId}@local.invalid`, name: typeof input.name === "string" ? input.name : undefined } })
      : await db.user.upsert({ where: { email: email! }, update: { name: typeof input.name === "string" ? input.name : undefined }, create: { email: email!, name: typeof input.name === "string" ? input.name : undefined } });

    const previous = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const profile = await db.journeyProfile.upsert({ where: { userId: user.id }, update: input, create: { userId: user.id, ...input } });

    const phaseChanged = previous && previous.currentPhase !== profile.currentPhase;
    await db.journeyEvent.create({ data: { userId: user.id, phase: profile.currentPhase, type: phaseChanged ? "phase_changed" : "profile_updated", title: phaseChanged ? `Moved to ${profile.currentPhase}` : "Journey profile updated", detail: "Student journey state saved to the persistent record." } });
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    console.error("[abroadshield/journey PUT]", error);
    return NextResponse.json({ ok: false, error: "Could not save journey." }, { status: 500 });
  }
}
