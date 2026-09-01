import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TASKS = [
  "document_check",
  "draft_email",
  "job_search",
  "tailor_cv",
  "deadline_scan",
  "housing_search",
  "visa_check",
] as const;

type TaskType = (typeof TASKS)[number];

type TaskRequest = { taskType?: string; context?: string; profile?: AgentProfile };

function taskInstruction(taskType: TaskType, profileContext: string, request: string) {
  const common = `You are an execution agent inside AbroadShield AI.\nAUTHENTICATED STUDENT PROFILE:\n${profileContext}\n\nRules:\n- Never invent personal facts not in the profile.\n- Never claim an external action was completed unless this request actually performs it.\n- Never fabricate live URLs, employers, deadlines, prices, legal requirements, listings, or verification results.\n- If live external data or a connector is required but unavailable, say so explicitly.\n- Return valid JSON only.`;
  const instructions: Record<TaskType, string> = {
    document_check: `${common}\nPerform an informational document pre-check, not legal certification. Return {"status":"verified|issue|missing|needs_review","summary":string,"issues":string[],"agentActions":string[],"priority":"critical|high|medium|low","verificationNote":string}.`,
    draft_email: `${common}\nDraft a professional email. Return {"subject":string,"to":"recipient/role","body":string,"notes":string,"requiresApproval":true}. Do not send it.`,
    job_search: `${common}\nCreate a research-ready search specification. Do not fabricate live openings. Return {"status":"needs_live_search|shortlist","query":string,"criteria":string[],"roles":[{"title":string,"company":string,"location":string,"matchReason":string,"sponsorshipStatus":"unknown|verified","source":"needs_live_search"}],"nextAction":string}.`,
    tailor_cv: `${common}\nTailor CV content only from supplied facts. Never invent experience or metrics. Return {"role":string,"bulletPoints":string[],"keywords":string[],"coverLetterOpening":string,"agentNote":string}.`,
    deadline_scan: `${common}\nIdentify deadlines only from supplied dates. Never invent countdowns. Return {"status":"ready|needs_profile_data","deadlines":[{"title":string,"date":string,"severity":"critical|warning|info","description":string,"agentAction":string}],"missingData":string[]}.`,
    housing_search: `${common}\nBuild a housing search specification. Do not invent live listings. Return {"status":"needs_live_search|ready","searchArea":string,"criteria":string[],"budget":string,"nextAction":string}.`,
    visa_check: `${common}\nAnswer conservatively, distinguish guidance from legal advice, and name the official authority to verify. Return {"question":string,"answer":string,"riskLevel":"none|low|medium|high","officialAuthority":string,"agentActions":string[]}.`,
  };
  return `${instructions[taskType]}\n\nTASK REQUEST: ${request}`;
}

function readProfileCookie(req: NextRequest): AgentProfile {
  const raw = req.cookies.get("abroadshield-profile")?.value;
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw)) as AgentProfile;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as TaskRequest;
    const taskType = body.taskType as TaskType | undefined;
    if (!taskType || !TASKS.includes(taskType)) {
      return NextResponse.json({ ok: false, error: `Unknown task type. Valid types: ${TASKS.join(", ")}` }, { status: 400 });
    }

    const storedProfile = body.profile ?? readProfileCookie(req);
    const profile: AgentProfile = {
      ...storedProfile,
      name: storedProfile.name ?? session.user.name ?? undefined,
      email: session.user.email ?? storedProfile.email,
    };

    const request = body.context?.trim() || `Execute ${taskType} for this student.`;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: taskInstruction(taskType, buildAgentContext(profile), request) },
        { role: "user", content: request },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) return NextResponse.json({ ok: false, error: "Agent returned an empty result." }, { status: 502 });

    try {
      return NextResponse.json({ ok: true, taskType, result: JSON.parse(raw) });
    } catch {
      return NextResponse.json({ ok: true, taskType, result: raw, raw: true });
    }
  } catch (error) {
    console.error("[abroadshield/tasks] error", error);
    return NextResponse.json({ ok: false, error: "Task execution failed." }, { status: 500 });
  }
}
