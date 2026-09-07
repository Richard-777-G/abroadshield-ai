import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/abroadshield/authenticated-user";
import { db } from "@/lib/db";
import { sendMessage } from "@/lib/abroadshield/google-gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApprovalAction = "approved" | "edited" | "declined";
type ApprovalKind = "email" | "form" | "search" | "message" | "document";

function validAction(value: unknown): value is ApprovalAction {
  return value === "approved" || value === "edited" || value === "declined";
}
function validKind(value: unknown): value is ApprovalKind {
  return value === "email" || value === "form" || value === "search" || value === "message" || value === "document";
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const events = await db.journeyEvent.findMany({
      where: { userId: user.id, type: "approval_action" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const entries = events.flatMap((event) => {
      try {
        const metadata = JSON.parse(event.metadata ?? "{}");
        if (!validAction(metadata.action) || !validKind(metadata.kind)) return [];
        return [{
          id: event.id,
          action: metadata.action,
          kind: metadata.kind,
          title: event.title,
          recipient: metadata.recipient ?? "Not specified",
          detail: event.detail ?? "",
          time: event.createdAt.toISOString(),
          phase: event.phase,
          externalMessageId: metadata.externalMessageId ?? null,
        }];
      } catch { return []; }
    });
    return NextResponse.json({ ok: true, entries });
  } catch (error) {
    console.error("[approvals] GET", error);
    return NextResponse.json({ ok: false, error: "Could not load approval history." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    if (!validAction(body.action) || !validKind(body.kind) || typeof body.title !== "string" || typeof body.detail !== "string" || typeof body.phase !== "string") {
      return NextResponse.json({ ok: false, error: "Approval action is incomplete." }, { status: 400 });
    }
    const recipient = typeof body.recipient === "string" ? body.recipient.trim() : "";
    let externalMessageId: string | null = null;
    if (body.action === "approved" && body.kind === "email") {
      if (!recipient || !body.title.trim() || !body.detail.trim()) return NextResponse.json({ ok: false, error: "An approved email requires recipient, subject and body." }, { status: 400 });
      const sent = await sendMessage(user.id, recipient, body.title.trim(), body.detail);
      externalMessageId = sent.id;
    }
    const event = await db.journeyEvent.create({
      data: {
        userId: user.id,
        phase: body.phase,
        type: "approval_action",
        title: body.title.trim(),
        detail: body.detail,
        metadata: JSON.stringify({ action: body.action, kind: body.kind, recipient: recipient || null, externalMessageId }),
      },
    });
    return NextResponse.json({ ok: true, entry: { id: event.id, action: body.action, kind: body.kind, externalMessageId } });
  } catch (error) {
    console.error("[approvals] POST", error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Approval action failed." }, { status: 502 });
  }
}
