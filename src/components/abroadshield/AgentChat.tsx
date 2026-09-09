"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  Check,
  CheckCheck,
  Copy,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CHAT_STARTERS } from "./data";
import Reveal from "./Reveal";
import { useApprovalsStore, type ApprovalKind } from "./approvalsStore";
import { useProfileStore, type StudentProfile } from "./profileStore";
import OpportunityResultCard from "./OpportunityResultCard";
import ProviderDiagnosticsCard from "./ProviderDiagnosticsCard";
import type {
  Opportunity,
  OpportunityMatch,
} from "@/lib/abroadshield/opportunity-types";

type DraftAction = "none" | "approved" | "edited" | "declined";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  action?: DraftAction;
  actionResult?: string;
  actionError?: string;
  opportunities?: Opportunity[];
  matches?: OpportunityMatch[];
  sourceIds?: string[];
  sourceErrors?: Array<{ sourceId: string; message: string }>;
  opportunitySearch?: boolean;
};

function isDraftMessage(content: string): boolean {
  const lower = content.toLowerCase();
  const hasApprovalInstruction =
    lower.includes("approve to send") ||
    lower.includes("approve / edit / decline");
  const hasSubject = /^subject:\s*.+$/im.test(content);
  const hasRecipient = /^(?:to|recipient):\s*.+$/im.test(content);
  const hasBodyMarker = /^body:\s*$/im.test(content);

  return (
    hasApprovalInstruction ||
    (hasSubject &&
      hasRecipient &&
      (hasBodyMarker || /^dear\b/im.test(content)))
  );
}

function buildWelcome(profile: StudentProfile): Message {
  const name = profile.name || "there";
  const context = [
    [profile.origin, profile.destination].filter(Boolean).join(" → "),
    [profile.course, profile.university].filter(Boolean).join(" · "),
    profile.intake ? `${profile.intake} intake` : "",
    `Current phase: ${profile.currentPhase.replaceAll("-", " ")}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    id: "welcome",
    role: "assistant",
    content: `Hi **${name}** — I’m your AbroadShield agent.\n\n${
      context
        ? `I have your journey context: **${context}**.\n\n`
        : ""
    }Give me a task in plain language. I’ll execute what the current stage allows, use live sources where required, and never claim an external action happened unless the system actually did it.`,
  };
}

function getAgentError(data: unknown, status: number): string {
  const error =
    data &&
    typeof data === "object" &&
    typeof (data as { error?: unknown }).error === "string"
      ? (data as { error: string }).error
      : "";

  if (status === 403 && /credit card|billing|credits/i.test(error)) {
    return "The agent is connected, but the AI provider account is blocked by billing. No task was falsely marked complete.";
  }

  if (error) return error;
  return `The agent service returned HTTP ${status}. Please retry.`;
}

export default function AgentChat() {
  const { profile } = useProfileStore();
  const [messages, setMessages] = useState<Message[]>([buildWelcome(profile)]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const addEntry = useApprovalsStore((state) => state.addEntry);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  useEffect(() => {
    const handler = (event: Event) => {
      const prompt = (event as CustomEvent<string>).detail;
      if (prompt) {
        setInput(prompt);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    window.addEventListener("abroadshield:prefill-chat", handler);
    return () => window.removeEventListener("abroadshield:prefill-chat", handler);
  }, []);

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
    const conversation = messages[0]?.id === "welcome" ? messages.slice(1) : messages;
    const history = conversation.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((current) => {
      const base = current[0]?.id === "welcome" ? current.slice(1) : current;
      return [...base, userMsg, pendingMsg];
    });
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/abroadshield/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, messages: history }),
      });
      const data = await response.json().catch(() => null);
      const reply =
        data?.ok && typeof data.reply === "string"
          ? data.reply
          : getAgentError(data, response.status);

      setMessages((current) =>
        current.map((message) =>
          message.id === pendingMsg.id
            ? {
                ...message,
                content: reply,
                pending: false,
                opportunities: data?.opportunities,
                matches: data?.matches,
                sourceIds: data?.sourceIds,
                sourceErrors: data?.sourceErrors,
                opportunitySearch: data?.opportunitySearch,
              }
            : message,
        ),
      );
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingMsg.id
            ? {
                ...message,
                content: "Network error reaching the agent. Check your connection and retry.",
                pending: false,
              }
            : message,
        ),
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([buildWelcome(profile)]);
    setInput("");
  };

  const markAction = async (id: string, action: DraftAction) => {
    const message = messages.find((item) => item.id === id);
    if (!message || message.role !== "assistant" || action === "none") return;

    const meta = extractDraftMeta(message.content);
    if (!meta) {
      setMessages((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                actionError: "This response is not a valid email draft. Nothing was submitted.",
              }
            : item,
        ),
      );
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, action, actionResult: "Processing…", actionError: undefined }
          : item,
      ),
    );

    const result = await addEntry({
      action,
      kind: meta.kind,
      title: meta.title,
      recipient: meta.recipient,
      detail: meta.detail,
      phase: meta.phase,
    });

    if (!result.ok) {
      setMessages((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                action: "none",
                actionResult: undefined,
                actionError: result.error || "The action could not be recorded.",
              }
            : item,
        ),
      );
      return;
    }

    const label =
      result.executionStatus === "sent"
        ? "Sent successfully through Gmail."
        : action === "approved"
          ? "Approval recorded; no external action was executed."
          : `Decision recorded: ${action}.`;

    setMessages((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, actionResult: label, actionError: undefined }
          : item,
      ),
    );
  };

  return (
    <section id="agent" className="relative w-full bg-transparent py-6 sm:py-8">
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.1)] px-3.5 py-1 text-[11px] font-mono font-bold tracking-wide text-[var(--shield-emerald-bright)]">
            <Sparkles className="h-3.5 w-3.5" />
            Autonomous Execution Co-Pilot · Active
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ask it <span className="as-text-gradient">to do the work.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--shield-text-dim)]">
            One task at a time. The agent carries your journey context, respects verified statutory rules, and returns interactive work surfaces you control.
          </p>
        </Reveal>

        <div className="overflow-hidden rounded-3xl border border-[var(--shield-border)] bg-[linear-gradient(180deg,oklch(0.16_0.02_255/0.95),oklch(0.12_0.015_255/0.98))] shadow-2xl">
          <div className="relative flex items-center justify-between border-b border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-5 py-4">
            <div className="relative flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[oklch(0.76_0.18_160/0.5)] bg-[oklch(0.76_0.18_160/0.15)] text-[var(--shield-emerald-bright)]">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--shield-ink)] bg-[var(--shield-emerald-bright)] as-pulse" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">AbroadShield Agent Co-Pilot</div>
                <div className="text-[11px] font-mono text-[var(--shield-text-dim)]">
                  {profile.name
                    ? `Carrying ${profile.name}'s journey context`
                    : "Ready for your journey context"}{" "}
                  · {profile.currentPhase.replaceAll("-", " ")}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink)] px-3 py-1.5 text-[11px] font-semibold text-[var(--shield-text-dim)] transition hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Terminal
            </button>
          </div>

          <div
            ref={scrollRef}
            className="as-scroll max-h-[460px] min-h-[340px] space-y-4 overflow-y-auto bg-[oklch(0.14_0.018_165/0.5)] p-5 sm:p-6"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onAction={markAction} />
            ))}
          </div>

          {messages.length <= 1 && (
            <div className="border-t border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-5 py-4 sm:px-6">
              <div className="mb-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--shield-text-faint)]">
                Autonomous Task Starters //
              </div>
              <div className="flex flex-wrap gap-2">
                {CHAT_STARTERS.map((starter) => (
                  <button
                    type="button"
                    key={starter.label}
                    onClick={() => void send(starter.prompt)}
                    disabled={sending}
                    className="rounded-full border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.1)] px-3.5 py-1.5 text-xs font-semibold text-[var(--shield-emerald-bright)] transition hover:border-[oklch(0.76_0.18_160/0.8)] hover:bg-[oklch(0.76_0.18_160/0.2)] disabled:opacity-50"
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder="Ask your co-pilot for a real task or opportunity search…"
                className="as-scroll max-h-32 flex-1 resize-none rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] px-4 py-3 text-sm text-[var(--shield-text)] placeholder:text-[var(--shield-text-dim)] focus:border-[oklch(0.76_0.18_160/0.6)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.76_0.18_160/0.4)]"
              />
              <button
                type="button"
                onClick={() => void send(input)}
                disabled={!input.trim() || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--shield-text)] text-[var(--shield-ink)] font-bold transition hover:opacity-90 disabled:opacity-30"
                aria-label="Send"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[var(--shield-text-faint)]">
              <span>Enter to send · Shift+Enter for newline</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--shield-emerald-bright)]">
                Approval-Gated External Action
              </span>
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
  const showActions =
    isDraft &&
    (!message.action || message.action === "none") &&
    !message.actionError;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access is optional; the message remains usable without it.
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
            <span className="ml-2 text-xs text-[var(--shield-text-dim)]">the agent is working…</span>
          </div>
        ) : isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <>
            <div className="prose prose-sm prose-invert max-w-none [&_a]:text-[oklch(0.85_0.19_158)] [&_a]:underline [&_code]:rounded [&_code]:bg-[oklch(0.14_0.018_165/0.8)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[oklch(0.86_0.17_80)] [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--shield-border)] [&_pre]:bg-[oklch(0.14_0.018_165/0.8)] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {message.opportunities && message.opportunities.length > 0 ? (
              <div className="mt-4 border-t border-[var(--shield-border)] pt-3">
                <div className="flex items-center justify-between pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--shield-emerald-bright)]">
                  <span>Verified Listings ({message.opportunities.length})</span>
                  <span className="text-[10px] font-normal text-[var(--shield-text-dim)]">L1 Discovery &amp; Prep</span>
                </div>
                <div className="space-y-3">
                  {message.opportunities.map((opportunity) => {
                    const match = message.matches?.find(
                      (m) => m.opportunityId === opportunity.canonicalId,
                    );
                    return (
                      <OpportunityResultCard
                        key={opportunity.canonicalId}
                        opportunity={opportunity}
                        match={match}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (message.opportunitySearch || (message.sourceErrors && message.sourceErrors.length > 0)) ? (
              <ProviderDiagnosticsCard
                sourceId="france-travail"
                sourceErrors={message.sourceErrors}
              />
            ) : null}

            {isDraft && (
              <div className="mt-3 border-t border-[var(--shield-border)] pt-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--shield-text-faint)]">
                  Review before sending
                </div>

                {showActions && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onAction(message.id, "approved")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[oklch(0.74_0.17_162)] px-3 py-2 text-[10px] font-semibold text-[oklch(0.14_0.018_165)]"
                    >
                      <Check className="h-3 w-3" />
                      Approve &amp; send
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction(message.id, "declined")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--shield-border)] px-3 py-2 text-[10px] text-[var(--shield-text-dim)]"
                    >
                      <X className="h-3 w-3" />
                      Decline
                    </button>
                  </div>
                )}

                {message.actionResult && (
                  <div className="mt-2 text-[11px] text-[var(--shield-text-dim)]">
                    <Check className="mr-1 inline h-3 w-3 text-[oklch(0.85_0.19_158)]" />
                    {message.actionResult}
                  </div>
                )}

                {message.actionError && (
                  <div className="mt-2 text-[11px] text-[oklch(0.72_0.19_22)]">
                    <AlertCircle className="mr-1 inline h-3 w-3" />
                    {message.actionError}
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1 text-[10px] text-[var(--shield-text-faint)] hover:text-[var(--shield-text-dim)]"
              >
                {copied ? (
                  <>
                    <CheckCheck className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function extractDraftMeta(
  content: string,
): {
  kind: ApprovalKind;
  title: string;
  recipient?: string;
  detail: string;
  phase: string;
} | null {
  const subject = content.match(/^subject:\s*(.+)$/im)?.[1]?.trim();
  const recipient = content.match(/(?:to|recipient):\s*([^\n]+)/i)?.[1]?.trim();
  if (!subject || !recipient) return null;

  const bodyMatch = content.match(/(?:^|\n)body:\s*\n?([\s\S]+)$/i);
  const detail = (
    bodyMatch?.[1]?.trim() ||
    content
      .replace(/^subject:\s*.+$/im, "")
      .replace(/^(?:to|recipient):\s*[^\n]+$/im, "")
      .trim()
  ).slice(0, 2000);

  if (!detail) return null;

  return {
    kind: "email",
    title: subject,
    recipient,
    detail,
    phase: "",
  };
}
