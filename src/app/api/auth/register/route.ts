import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { name?: unknown; email?: unknown; password?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (name.length < 2) return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    if (password.length < 8 || password.length > 128) return NextResponse.json({ ok: false, error: "Password must be between 8 and 128 characters." }, { status: 400 });

    const existing = await db.user.findUnique({ where: { email } });
    if (existing?.passwordHash) return NextResponse.json({ ok: false, error: "An account already exists for this email. Sign in instead." }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const user = existing
      ? await db.user.update({ where: { id: existing.id }, data: { name, passwordHash } })
      : await db.user.create({ data: { email, name, passwordHash } });

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json({ ok: false, error: "Could not create your account." }, { status: 500 });
  }
}
