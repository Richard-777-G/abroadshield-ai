import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { normalizePhase } from "@/lib/abroadshield/journey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
  const events = await db.journeyEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ ok: true, events });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const event = await db.journeyEvent.create({ data: { userId, phase: normalizePhase(body.phase), type: String(body.type || "activity"), title: String(body.title || "Journey activity"), detail: body.detail ? String(body.detail) : null, metadata: body.metadata ? JSON.stringify(body.metadata) : null } });
    return NextResponse.json({ ok: true, event });
  } catch (error) {
    console.error("[abroadshield/events]", error);
    return NextResponse.json({ ok: false, error: "Could not record journey event." }, { status: 500 });
  }
}
