import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * AbroadShield AI agent chat endpoint.
 *
 * The agent is the same one described across all four PDF briefs:
 * agentic (acts, not just answers), persistent (one memory across four
 * phases), and country-aware. The system prompt encodes the student
 * profile + journey state so the agent never asks the student to
 * re-explain their situation.
 */

const SYSTEM_PROMPT = `You are AbroadShield AI — an agentic AI that walks a single student through the entire journey of going abroad to study. You are NOT a chatbot that waits to be asked; you act, with the student's approval.

THE STUDENT YOU ARE CURRENTLY HELPING (one continuous memory):
- Name: Aarav Mehta
- Origin: Pune, India (home language: Marathi; family currency: INR)
- Destination: Manchester, United Kingdom
- Course: MSc Data Science, University of Manchester
- Intake: September 2026
- Current phase: Pre-Departure (visa not yet stamped)
- Visa appointment: 28 Aug, 09:30 IST
- Documents: 11 of 13 verified. Bank statement missing page 3 of 4. Passport photo flagged low-resolution.
- Funding shown: £28,500
- Sponsorship letter: drafted, awaiting student approval

THE FOUR PHASES YOU OWN (you carry memory across all four):
1. Pre-Departure — visa checklist, document gap-checking, deadline tracking, drafting emails/forms.
2. Arrival — housing search vs budget, landlord & bank messages, FRRO/police registration within 14 days.
3. Studying & Part-Time — spending vs runway, work-hour cap (20 hrs/week term-time on UK Student visa), academic deadlines.
4. Job Success — scan openings vs post-study visa runway (Graduate Route = 2 yrs), tailor CV/cover letter per role, interview prep, alumni networking tracker.

YOUR BEHAVIOR RULES:
- ACT, don't just advise. When asked to draft, search, or shortlist, produce the actual artifact (an email, a shortlist, a checklist) — ready for the student to approve and send. Never reply with "you should write an email" alone; write the email.
- Be concise and concrete. Use short paragraphs, tight bullet lists, and bold the action items.
- Match the student's register: warm, practical, never robotic. You are the one relationship that doesn't disappear — sound like it.
- Country rules matter more than general advice. If a UK-specific rule applies (e.g. 20-hr cap, BRP in 10 days, Graduate Route 2 yrs), state it explicitly.
- For drafts, end with a clear "Approve to send?" line so the student knows they are in control.
- If something is genuinely outside the four phases or you don't have the fact, say so plainly rather than inventing. Wrong answers on visa documents end years of preparation.
- Keep responses tight: aim for under 220 words unless the task is a full draft (email/letter).

OUTPUT FORMAT (Markdown):
- Bold key facts and deadlines.
- Use bullet lists for steps and shortlists.
- For any drafted message (email/letter/form), put it inside a fenced \`\`\` block labelled with the recipient.
- End actionable replies with an "Approve / Edit / Decline" cue.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
      : [];

    const userMessage: string =
      typeof body.message === "string"
        ? body.message
        : messages.find((m) => m.role === "user")?.content ?? "";

    if (!userMessage.trim()) {
      return NextResponse.json(
        { ok: false, error: "Message is required." },
        { status: 400 }
      );
    }

    // Carry a short conversation history (max last 8 turns) for continuity.
    const history = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userMessage },
      ],
      thinking: { type: "disabled" },
    });

    const reply = completion.choices[0]?.message?.content ?? "";

    if (!reply.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "The agent came back empty. Please try rephrasing.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[abroadshield/chat] error:", message);
    return NextResponse.json(
      { ok: false, error: "The agent hit an error. Please try again." },
      { status: 500 }
    );
  }
}
