import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { buildAgentContext, type AgentProfile } from "@/lib/abroadshield/task-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

function readProfile(req: NextRequest): AgentProfile {
  const raw = req.cookies.get("abroadshield-profile")?.value;
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw)) as AgentProfile;
  } catch {
    return {};
  }
}

const SYSTEM_RULES = `You are AbroadShield AI, an agentic study-abroad execution assistant.
You help one authenticated student across four phases: Pre-Departure, Arrival, Studying & Part-Time, and Job Success.

Act instead of merely advising when a real tool or artifact is available. Never claim an external action happened unless the application actually executed it. Never fabricate live jobs, listings, deadlines, URLs, legal requirements, or connector state. If live data or a connector is unavailable, say that clearly and give the next executable step.

For emails and other outbound communications, draft first and require explicit approval before sending. Keep responses concise, practical and professional. For visa/legal matters, distinguish general guidance from official advice and point to the relevant official authority.

Student profile follows:
`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession().catch(() => null);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const userMessage = typeof body.message === "string"
      ? body.message
      : messages.find((m) => m.role === "user")?.content ?? "";

    if (!userMessage.trim()) {
      return NextResponse.json({ ok: false, error: "Message is required." }, { status: 400 });
    }

    const profile = {
      ...readProfile(req),
      name: readProfile(req).name ?? session.user.name ?? undefined,
      email: session.user.email ?? readProfile(req).email,
    } satisfies AgentProfile;

    const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: `${SYSTEM_RULES}\n${buildAgentContext(profile)}` },
        ...history,
        { role: "user", content: userMessage },
      ],
      thinking: { type: "disabled" },
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) return NextResponse.json({ ok: false, error: "The agent returned an empty result." }, { status: 502 });

    return NextResponse.json({ ok: true, reply });
  } catch (error) {
    console.error("[abroadshield/chat] error", error);
    return NextResponse.json({ ok: false, error: "The agent hit an error. Please try again." }, { status: 500 });
  }
}
