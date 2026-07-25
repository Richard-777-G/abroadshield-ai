"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Loader2,
  Check,
  Pencil,
  X,
  Copy,
  CheckCheck,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CHAT_STARTERS, STUDENT } from "./data";
import Reveal from "./Reveal";
import { useApprovalsStore, type ApprovalKind } from "./approvalsStore";

type DraftAction = "none" | "approved" | "edited" | "declined";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  action?: DraftAction;
}

/**
 * Detect whether an assistant reply is an actionable draft (email, letter,
 * form) that should carry Approve / Edit / Decline controls. The system
 * prompt tells the LLM to end drafts with "Approve / Edit / Decline" and to
 * wrap drafted messages in fenced blocks — we detect both signals.
 */
function isDraftMessage(content: string): boolean {
  if (!content) return false;
  const lower = content.toLowerCase();
  const hasApproveCue =
    lower.includes("approve to send") ||
    lower.includes("approve / edit / decline") ||
    lower.includes("approve/edit/decline") ||
    lower.includes("approve · edit · decline");
  const hasDraftSignal =
    /^subject:/im.test(content) ||
    /^dear\b/im.test(content) ||
    /```/.test(content);
  return hasApproveCue || hasDraftSignal;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hi **Aarav** — I'm your AbroadShield agent. I've got your full journey in memory: **Pune → Manchester**, MSc Data Science, Sep 2026 intake, visa appointment **28 Aug**.\n\nAsk me to **draft**, **check**, **shortlist**, or **explain** — I'll do the work and hand you something ready to approve. Try one of the starters below, or just tell me what's next.`,
};

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const pendingMsg: Message = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: "",
      pending: true,
    };

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((m) => [...m, userMsg, pendingMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/abroadshield/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          messages: history,
        }),
      });
      const data = await res.json();
      const reply =
        data?.ok && typeof data.reply === "string"
          ? data.reply
          : "I hit a snag reaching the model. Please try again in a moment.";
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id ? { ...msg, content: reply, pending: false } : msg
        )
      );
    } catch {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? {
                ...msg,
                content:
                  "Network error reaching the agent. Check your connection and retry.",
                pending: false,
              }
            : msg
        )
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  const addEntry = useApprovalsStore((s) => s.addEntry);

  const markAction = (id: string, action: DraftAction) => {
    setMessages((m) =>
      m.map((msg) => (msg.id === id ? { ...msg, action } : msg))
    );
    // Push to the shared approvals store so the ApprovalsHistory reflects
    // the user's real action on this draft.
    if (action === "none") return;
    const msg = messages.find((m) => m.id === id);
    if (!msg || msg.role !== "assistant") return;
    const meta = extractDraftMeta(msg.content);
    addEntry({
      action,
      kind: meta.kind,
      title: meta.title,
      recipient: meta.recipient,
      detail: meta.detail,
      phase: meta.phase,
    });
  };

  return (
    <section
      id="agent"
      className="relative w-full scroll-mt-20 bg-transparent py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.4)] to-transparent" />
      <div className="pointer-events-none absolute inset-0 as-radial-emerald opacity-50" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        {/* heading */}
        <Reveal className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.08)] px-3 py-1 text-[11px] font-medium tracking-wide text-[oklch(0.85_0.19_158)]">
            <Sparkles className="h-3 w-3" />
            Talk to the actual agent · powered by live LLM
          </div>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            Ask it to{" "}
            <span className="as-text-gradient">do the work.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            This isn&apos;t a scripted demo. The agent carries {STUDENT.name}&apos;s memory
            and responds with real drafts, real checks, and real shortlists — ready for
            your approval.
          </p>
        </Reveal>

        {/* chat surface */}
        <div className="overflow-hidden rounded-3xl border border-[oklch(0.74_0.17_162/0.3)] as-glass-strong">
          {/* header */}
          <div className="flex items-center justify-between border-b border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]">
                <Bot className="h-4.5 w-4.5 text-[oklch(0.85_0.19_158)]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[oklch(0.22_0.025_165)] bg-[oklch(0.74_0.17_162)] as-pulse" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--shield-text)]">
                  AbroadShield Agent
                </div>
                <div className="text-[11px] text-[var(--shield-text-dim)]">
                  Carrying Aarav&apos;s memory · Phase 1 active
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-3 py-1.5 text-[11px] font-medium text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* messages */}
          <div
            ref={scrollRef}
            className="as-scroll max-h-[460px] min-h-[340px] space-y-4 overflow-y-auto bg-[oklch(0.14_0.018_165)/0.5)] p-5 sm:p-6"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onAction={markAction} />
            ))}
          </div>

          {/* starters */}
          {messages.length <= 1 && (
            <div className="border-t border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] px-5 py-4 sm:px-6">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--shield-text-dim)]">
                Try one
              </div>
              <div className="flex flex-wrap gap-2">
                {CHAT_STARTERS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => send(s.prompt)}
                    disabled={sending}
                    className="rounded-full border border-[oklch(0.74_0.17_162/0.35)] bg-[oklch(0.74_0.17_162/0.08)] px-3 py-1.5 text-xs font-medium text-[oklch(0.85_0.19_158)] transition hover:border-[oklch(0.74_0.17_162/0.6)] hover:bg-[oklch(0.74_0.17_162/0.15)] disabled:opacity-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* composer */}
          <div className="border-t border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Draft me an email to the consulate…"
                className="as-scroll max-h-32 flex-1 resize-none rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)/0.7)] px-4 py-3 text-sm text-[var(--shield-text)] placeholder:text-[var(--shield-text-dim)] focus:border-[oklch(0.74_0.17_162/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.74_0.17_162/0.4)]"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.74_0.17_162)] text-[oklch(0.14_0.018_165))] transition hover:bg-[oklch(0.85_0.19_158)] disabled:opacity-40 disabled:hover:bg-[oklch(0.74_0.17_162)] as-glow-emerald"
                aria-label="Send"
              >
                {sending ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
            <div className="mt-2 px-1 text-[10px] text-[var(--shield-text-dim)]">
              Enter to send · Shift+Enter for a new line · The agent never sends anything
              without your approval.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({
  message,
  onAction,
}: {
  message: Message;
  onAction: (id: string, action: DraftAction) => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const isDraft = !isUser && !message.pending && isDraftMessage(message.content);
  const showActions = isDraft && (!message.action || message.action === "none");
  const actionTaken = message.action && message.action !== "none";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked; fail silently */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
          isUser
            ? "border-[oklch(0.5_0.04_200/0.3)] bg-[oklch(0.24_0.028_165/0.7)]"
            : "border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-[var(--shield-text-dim)]" />
        ) : (
          <Bot className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[oklch(0.24_0.028_165/0.8)] text-[var(--shield-text)]"
            : "border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.7)] text-[var(--shield-text)]"
        }`}
      >
        {message.pending ? (
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.74_0.17_162)]" />
            <span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.74_0.17_162)]" />
            <span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.74_0.17_162)]" />
            <span className="ml-2 text-xs text-[var(--shield-text-dim)]">
              the agent is working…
            </span>
          </div>
        ) : isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <>
            <div className="prose prose-sm prose-invert max-w-none [&_a]:text-[oklch(0.85_0.19_158)] [&_a]:underline [&_code]:rounded [&_code]:bg-[oklch(0.14_0.018_165)/0.8)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[oklch(0.86_0.17_80)] [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--shield-border)] [&_pre]:bg-[oklch(0.14_0.018_165)/0.8)] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-[oklch(0.85_0.19_158)] [&_ul]:my-1.5 [&_li]:my-0.5 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const isInline = !className?.includes("language-");
                    if (isInline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* action bar for drafts */}
            {isDraft && (
              <DraftActionBar
                showActions={showActions}
                actionTaken={actionTaken}
                action={message.action}
                copied={copied}
                onCopy={copy}
                onApprove={() => onAction(message.id, "approved")}
                onEdit={() => onAction(message.id, "edited")}
                onDecline={() => onAction(message.id, "declined")}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function DraftActionBar({
  showActions,
  actionTaken,
  action,
  copied,
  onCopy,
  onApprove,
  onEdit,
  onDecline,
}: {
  showActions: boolean;
  actionTaken: boolean | "" | undefined;
  action?: DraftAction;
  copied: boolean;
  onCopy: () => void;
  onApprove: () => void;
  onEdit: () => void;
  onDecline: () => void;
}) {
  if (showActions) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--shield-border)] pt-3">
        <span className="mr-auto text-[11px] text-[var(--shield-text-dim)]">
          The agent prepared this. You decide.
        </span>
        <button
          onClick={onApprove}
          className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.74_0.17_162)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.14_0.018_165))] transition hover:bg-[oklch(0.85_0.19_158)] as-glow-emerald"
        >
          <Check className="h-3.5 w-3.5" />
          Approve &amp; send
        </button>
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.8_0.15_80/0.45)] bg-[oklch(0.8_0.15_80/0.1)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.86_0.17_80)] transition hover:bg-[oklch(0.8_0.15_80/0.18)]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={onDecline}
          className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.5_0.04_200/0.3)] bg-[oklch(0.22_0.025_165/0.5)] px-3 py-1.5 text-xs font-semibold text-[var(--shield-text-dim)] transition hover:border-[oklch(0.65_0.2_25/0.5)] hover:text-[oklch(0.72_0.2_25)]"
        >
          <X className="h-3.5 w-3.5" />
          Decline
        </button>
      </div>
    );
  }

  // action already taken — show confirmation chip + copy
  const label =
    action === "approved"
      ? "Approved — sent on your behalf"
      : action === "edited"
        ? "Marked for your edits"
        : action === "declined"
          ? "Declined — not sent"
          : "";

  const chipClass =
    action === "approved"
      ? "border-[oklch(0.74_0.17_162/0.45)] bg-[oklch(0.74_0.17_162/0.12)] text-[oklch(0.85_0.19_158)]"
      : action === "edited"
        ? "border-[oklch(0.8_0.15_80/0.45)] bg-[oklch(0.8_0.15_80/0.12)] text-[oklch(0.86_0.17_80)]"
        : "border-[oklch(0.5_0.04_200/0.3)] bg-[oklch(0.22_0.025_165/0.5)] text-[var(--shield-text-dim)]";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--shield-border)] pt-3">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${chipClass}`}
      >
        {action === "approved" && <CheckCheck className="h-3.5 w-3.5" />}
        {action === "edited" && <Pencil className="h-3.5 w-3.5" />}
        {action === "declined" && <X className="h-3.5 w-3.5" />}
        {label}
      </span>
      <button
        onClick={onCopy}
        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-2.5 py-1 text-[11px] font-medium text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]"
      >
        {copied ? (
          <>
            <CheckCheck className="h-3 w-3" /> Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" /> Copy
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Extract structured metadata from an agent draft reply so it can be logged
 * in the ApprovalsHistory. Infers the kind (email/form/search/etc.), a
 * short title, the recipient, a detail snippet, and the journey phase from
 * the content.
 */
function extractDraftMeta(content: string): {
  kind: ApprovalKind;
  title: string;
  recipient: string;
  detail: string;
  phase: string;
} {
  const lower = content.toLowerCase();

  // infer kind
  let kind: ApprovalKind = "message";
  if (/subject:/i.test(content) || /dear\b/i.test(content)) kind = "email";
  else if (/shortlist|listings|compared/i.test(lower)) kind = "search";
  else if (/form|registration|application form/i.test(lower)) kind = "form";
  else if (/cv|cover letter|tailor/i.test(lower)) kind = "document";

  // extract title — first non-empty line, strip markdown
  const lines = content.split("\n").filter((l) => l.trim());
  let title = lines[0]?.replace(/[*#`]/g, "").trim() || "Agent draft";
  if (title.length > 60) title = title.slice(0, 57) + "…";

  // extract recipient — from "Dear X" or "Subject:" context
  let recipient = "Saved to your vault";
  const dearMatch = content.match(/Dear\s+([^,\n]+)/i);
  if (dearMatch) {
    recipient = dearMatch[1].trim();
  } else if (/consulate|embassy|visa/i.test(lower)) {
    recipient = "UK Visa & Immigration";
  } else if (/landlord|property|viewing/i.test(lower)) {
    recipient = "Property manager";
  } else if (/bank|barclays|hsbc/i.test(lower)) {
    recipient = "Student bank branch";
  } else if (/alumni|networking/i.test(lower)) {
    recipient = "Alumni network";
  }

  // detail — first 120 chars of body (skip title line)
  const body = lines.slice(1).join(" ").replace(/[*#`]/g, "").trim();
  const detail = body.length > 120 ? body.slice(0, 117) + "…" : body || "Draft prepared by the agent for your review.";

  // infer phase from keywords
  let phase = "Pre-Departure";
  if (/visa appointment|consulate|passport|forex|flight/i.test(lower)) phase = "Pre-Departure";
  else if (/housing|landlord|bank|sim|registration|frro|brp/i.test(lower)) phase = "Arrival";
  else if (/work.hour|budget|coursework|dissertation|part-time/i.test(lower)) phase = "Studying";
  else if (/cv|interview|job|alumni|sponsorship/i.test(lower)) phase = "Job Success";

  return { kind, title, recipient, detail, phase };
}
