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

type TaskRequest = {
  taskType?: string;
  context?: string;
  profile?: AgentProfile;
};

function taskInstruction(taskType: TaskType, context: string) {
  const common = `
You are an execution agent inside AbroadShield AI.
The following is the authenticated student's current profile:
${context}

Rules:
- Never invent personal facts that are not in the profile.
- Never claim an external action was completed unless this request actually performs that action.
- Never fabricate URLs, employers, deadlines, prices, legal requirements, or verification results.
- If external data or a connector is required but unavailable, say so explicitly in the result.
- Produce valid JSON only.
`;

  const instructions: Record<TaskType, string> = {
    document_check: `${common}
Check the requested document against the destination-specific requirements known to the model. This is an informational pre-check, not legal certification.
Return {"status":"verified|issue|missing|needs_review","summary":string,"issues":string[],"agentActions":string[],"priority":"critical|high|medium|low","verificationNote":string}.`,
    draft_email: `${common}
Draft a professional email for the requested purpose. Return {"subject":string,"to":"recipient/role","body":string,"notes":string,"requiresApproval":true}. Do not send it.`,
    job_search: `${common}
Create a research-ready shortlist based only on the supplied profile and request. Do not fabricate live openings. Return {"status":"needs_live_search|shortlist","query":string,"criteria":string[],"roles": [{"title":string,"company":string,"location":string,"matchReason":string,"sponsorshipStatus":"unknown|verified","source":"needs_live_search"}],"nextAction":string}.`,
    tailor_cv: `${common}
Tailor CV content only from information in the profile and the supplied task context. Never invent experience or metrics. Return {"role":string,"bulletPoints":string[],"keywords":string[],"coverLetterOpening":string,"agentNote":string}.`,
    deadline_scan: `${common}
Identify deadlines only when dates are actually supplied. Do not invent countdowns. Return {"status":"ready|needs_profile_data","deadlines":[{"title":string,"date":string,"severity":"critical|warning|info","description":string,"agentAction":string}],"missingData":string[]}.`,
    housing_search: `${common}
Build a housing search specification from the student's destination, university, budget and timing. Do not invent live listings. Return {"status":"needs_live_search|ready","searchArea":string,"criteria":string[],"budget":string,"nextAction":string}.`,
    visa_check: `${common}
Answer the specific visa question conservatively. Distinguish general guidance from official/legal advice and identify the official authority that should be checked. Return {"question":string,"answer":string,"riskLevel":"none|low|medium|high","officialAuthority":string,"agentActions":string[]}.`,
  };

  return `${instructions[taskType]}\n\nTASK REQUEST: ${context}`;
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
      return NextResponse.json(
        { ok: false, error: `Unknown task type. Valid types: ${TASKS.join(", ")}` },
        { status: 400 }
      );
    }

    const profile: AgentProfile = {
      ...(body.profile ?? {}),
      name: body.profile?.name ?? session.user.name ?? undefined,
      email: session.user.email ?? body.profile?.email,
    };

    const context = body.context?.trim() || `Execute ${taskType} for this student.`;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: taskInstruction(taskType, buildAgentContext(profile)) },
        { role: "user", content: context },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return NextResponse.json({ ok: false, error: "Agent returned an empty result." }, { status: 502 });
    }

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
