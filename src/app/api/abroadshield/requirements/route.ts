import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { buildRequirementSnapshot } from "@/lib/abroadshield/requirements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUser() {
  const session = await getServerSession();
  const id = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!id && !email) return null;
  return id ? db.user.findUnique({ where: { id }, include: { journey: true } }) : db.user.findUnique({ where: { email: email! }, include: { journey: true } });
}

export async function GET() {
  try {
    const user = await resolveUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    return NextResponse.json({ ok: true, snapshot: buildRequirementSnapshot(user.journey ?? undefined) });
  } catch (error) {
    console.error("[abroadshield/requirements]", error);
    return NextResponse.json({ ok: false, error: "Could not build requirements." }, { status: 500 });
  }
}
