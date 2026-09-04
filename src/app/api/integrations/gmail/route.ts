import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { sendMessage } from "@/lib/abroadshield/google-gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUserId() {
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
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ ok: true, connected: false, email: null });
    const connection = await db.googleConnection.findUnique({ where: { userId_provider: { userId, provider: "google" } }, select: { email: true, accessToken: true, scope: true } });
    const scopes = connection?.scope?.split(/\s+/) ?? [];
    const connected = Boolean(connection?.accessToken && scopes.includes("https://www.googleapis.com/auth/gmail.send"));
    return NextResponse.json({ ok: true, connected, email: connected ? connection?.email ?? null : null });
  } catch (error) {
    console.error("[gmail integration status]", error);
    return NextResponse.json({ ok: false, error: "Could not determine Gmail connection status." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as { action?: unknown; to?: unknown; subject?: unknown; body?: unknown };
    if (body.action !== "send" || typeof body.to !== "string" || typeof body.subject !== "string" || typeof body.body !== "string" || !body.to.trim() || !body.subject.trim() || !body.body.trim()) {
      return NextResponse.json({ ok: false, error: "Send requires action, to, subject and body." }, { status: 400 });
    }
    const result = await sendMessage(userId, body.to.trim(), body.subject.trim(), body.body);
    return NextResponse.json({ ok: true, messageId: result.id });
  } catch (error) {
    console.error("[gmail integration send]", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Gmail action failed." }, { status: 502 });
  }
}
