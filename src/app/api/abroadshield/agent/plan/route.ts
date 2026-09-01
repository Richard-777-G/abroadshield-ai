import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { normalizePhase } from "@/lib/abroadshield/journey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TaskType = "document_check" | "draft_email" | "job_search" | "tailor_cv" | "deadline_scan" | "housing_search" | "visa_check";

type Plan = { taskType: TaskType; title: string; reason: string; context: string; requiresApproval: boolean };

const ROUTES: Array<{ type: TaskType; patterns: RegExp[]; title: string; reason: string; approval: boolean }> = [
  { type: "document_check", patterns: [/document/i, /passport/i, /financial/i, /bank statement/i, /certificate/i, /letter/i], title: "Check documents", reason: "The request concerns evidence or document readiness.", approval: false },
  { type: "draft_email", patterns: [/email/i, /mail/i, /write to/i, /reply/i, /message/i, /contact/i], title: "Draft communication", reason: "The request needs an outbound communication draft.", approval: true },
  { type: "job_search", patterns: [/job/i, /work/i, /part.?time/i, /full.?time/i, /career/i, /vacanc/i, /employment/i], title: "Search opportunities", reason: "The request concerns employment or career opportunities.", approval: false },
  { type: "tailor_cv", patterns: [/cv/i, /resume/i, /cover letter/i, /tailor/i, /application/i], title: "Tailor application", reason: "The request needs application material based on the student's existing facts.", approval: false },
  { type: "deadline_scan", patterns: [/deadline/i, /due/i, /when do i/i, /calendar/i, /appointment/i, /date/i], title: "Scan deadlines", reason: "The request concerns dates or upcoming actions.", approval: false },
  { type: "housing_search", patterns: [/housing/i, /house/i, /room/i, /accommodation/i, /landlord/i, /rent/i], title: "Plan housing search", reason: "The request concerns accommodation.", approval: false },
  { type: "visa_check", patterns: [/visa/i, /immigration/i, /permit/i, /registration/i, /legal/i, /work.?hour/i], title: "Check immigration requirements", reason: "The request concerns immigration, compliance, or permission rules.", approval: false },
];

function inferTask(message: string, phase: string): Plan {
  const match = ROUTES.find((route) => route.patterns.some((pattern) => pattern.test(message)));
  if (match) return { taskType: match.type, title: match.title, reason: match.reason, context: message.trim(), requiresApproval: match.approval };
  const fallback: Record<string, { type: TaskType; title: string; reason: string }> = {
    "pre-departure": { type: "deadline_scan", title: "Find my next pre-departure action", reason: "No explicit task type was detected, so start with the current stage's next known date/action." },
    arrival: { type: "visa_check", title: "Check my arrival requirements", reason: "No explicit task type was detected, so verify arrival/registration requirements first." },
    studying: { type: "job_search", title: "Review current study-stage opportunities", reason: "No explicit task type was detected, so start with the most useful study-stage career action." },
    "job-success": { type: "job_search", title: "Review my job-search next step", reason: "No explicit task type was detected, so start with the current job-success workflow." },
  };
  const selected = fallback[phase] ?? fallback["pre-departure"];
  return { taskType: selected.type, title: selected.title, reason: selected.reason, context: message.trim(), requiresApproval: false };
}

async function resolveUser() {
  const session = await getServerSession();
  const id = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!id && !email) return null;
  return id
    ? db.user.upsert({ where: { id }, update: { name: session?.user?.name ?? undefined, email: email ?? undefined }, create: { id, email: email || `${id}@local.invalid`, name: session?.user?.name ?? undefined } })
    : db.user.upsert({ where: { email: email! }, update: { name: session?.user?.name ?? undefined }, create: { email: email!, name: session?.user?.name ?? undefined } });
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser();
    if (!user) return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
    const journey = await db.journeyProfile.findUnique({ where: { userId: user.id } });
    const phase = normalizePhase(journey?.currentPhase);
    const plan = inferTask(message, phase);
    const task = await db.journeyTask.create({ data: { userId: user.id, phase, type: plan.taskType, title: plan.title, status: "queued", priority: "medium", result: JSON.stringify({ orchestration: plan }) } });
    await db.journeyEvent.create({ data: { userId: user.id, phase, type: "agent_planned", title: plan.title, detail: plan.reason, metadata: JSON.stringify({ taskId: task.id, taskType: plan.taskType, requiresApproval: plan.requiresApproval }) } });
    return NextResponse.json({ ok: true, plan, taskId: task.id, phase });
  } catch (error) {
    console.error("[abroadshield/agent/plan]", error);
    return NextResponse.json({ ok: false, error: "Could not create an agent plan." }, { status: 500 });
  }
}
