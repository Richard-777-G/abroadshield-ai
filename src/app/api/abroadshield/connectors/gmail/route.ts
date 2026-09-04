import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { createDraft, listRecentMessages, sendMessage } from "@/lib/abroadshield/google-gmail";
import { normalizePhase } from "@/lib/abroadshield/journey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function userId() {
  const session = await getServerSession();
  const id = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (id) return id;
  if (!email) return null;
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  return user?.id ?? null;
}

export async function GET() {
  try {
    const id = await userId();
    if (!id) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const messages = await listRecentMessages(id, 10);
    return NextResponse.json({ ok: true, messages });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Gmail read failed." }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const id = await userId();
    if (!id) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const to = typeof body?.to === "string" ? body.to.trim() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const text = typeof body?.body === "string" ? body.body : "";
    if (!to || !subject || !text) return NextResponse.json({ ok: false, error: "to, subject and body are required." }, { status: 400 });
    if (action === "draft") return NextResponse.json({ ok: true, action, result: await createDraft(id, to, subject, text) });
    if (action !== "send") return NextResponse.json({ ok: false, error: "Supported actions: draft, send." }, { status: 400 });
    if (body?.approved !== true) return NextResponse.json({ ok: false, error: "Sending email requires explicit approval." }, { status: 400 });
    const result = await sendMessage(id, to, subject, text);
    const journey = await db.journeyProfile.findUnique({ where: { userId: id }, select: { currentPhase: true } });
    await db.journeyEvent.create({ data: { userId: id, phase: normalizePhase(journey?.currentPhase), type: "connector_action", title: "Gmail message sent", detail: "Approved Gmail message was sent.", metadata: JSON.stringify({ provider: "google", action: "send", messageId: result.id }) } });
    return NextResponse.json({ ok: true, action, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Gmail operation failed." }, { status: 502 });
  }
}
