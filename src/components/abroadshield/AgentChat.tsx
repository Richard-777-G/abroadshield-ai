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

function getAgentError(data: unknown, _status: number): string {
  const error =
    data &&
    typeof data === "object" &&
    typeof (data as { error?: unknown }).error === "string"
      ? (data as { error: string }).error
      : "";

  if (error && !/credit|billing|openrouter|quota|unauthorized|runtime/i.test(error)) {
    return error;
  }

  return "AbroadShield agent is temporarily syncing with verified regulatory registries. Please retry your inquiry in a moment.";
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

  useEffect(() => {
    const handleNewChat = () => {
      reset();
    };
    window.addEventListener("abroadshield:new-chat", handleNewChat);
    return () => window.removeEventListener("abroadshield:new-chat", handleNewChat);
  }, []);

  return (
    <div className="relative flex h-full min-h-[calc(100vh-3.5rem)] flex-col justify-between bg-transparent">
      {/* Scrollable Message Stage */}
      <div
        ref={scrollRef}
        className="as-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {/* ChatGPT / Claude Style Welcome Stage when no conversation yet */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="py-8 sm:py-14 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-[var(--shield-emerald-bright)] shadow-[0_0_35px_rgba(16,185,129,0.15)]">
                <Sparkles className="h-7 w-7" />
              </div>

              <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                How can AbroadShield co-pilot your move today?
              </h1>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1 text-xs font-mono text-[var(--shield-emerald-bright)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)] as-pulse" />
                  <span>
                    {profile.destination ? `${profile.destination}` : "Active Destination"} · Art. R5221-26 (964h/yr Ceiling)
                  </span>
                </span>
                {profile.course && (
                  <span className="rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1 text-xs text-[var(--shield-text-dim)]">
                    {profile.course}
                  </span>
                )}
              </div>

              <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[var(--shield-text-dim)] sm:text-sm">
                Direct conversational execution. The agent remembers your persistent journey context, verifies statutory ceilings, and uses primary sources.
              </p>

              {/* 4 High-Leverage Starter Cards in 2x2 Grid (Claude / ChatGPT style) */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2 text-left">
                {[
                  {
                    title: "France Travail Target Search",
                    tag: "VERIFIED API",
                    prompt: "Find internships in Paris related to my course compliant with student visa limits.",
                    desc: "Query official French employment databases under Art. R5221-26 limits.",
                  },
                  {
                    title: "Statutory Feasibility Audit",
                    tag: "L1 COMPLIANCE",
                    prompt: "Audit my student work authorization under French Article R5221-26 and check convention de stage rules.",
                    desc: "Verify 964h working limits, internship exemptions, and tax rules.",
                  },
                  {
                    title: "Alumni Outreach Email Draft",
                    tag: "APPROVAL GATED",
                    prompt: "Draft a concise professional outreach email to an alumni in my target field in Paris. Stop at the draft for my approval.",
                    desc: "Craft tailored contact messages with mandatory sign-off.",
                  },
                  {
                    title: "Application Plan & European CV",
                    tag: "DOSSIER",
                    prompt: "Prepare an application plan with European CV formatting and student work authorization clauses.",
                    desc: "Generate compliant dossier materials and roadmap.",
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void send(item.prompt)}
                    disabled={sending}
                    className="group flex flex-col justify-between rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-4 text-left transition hover:border-[var(--shield-border-strong)] hover:bg-white/[0.03]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-[var(--shield-emerald-bright)]">
                          {item.title}
                        </span>
                        <span className="rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-mono text-[var(--shield-emerald-bright)] border border-[oklch(0.76_0.18_160/0.3)]">
                          {item.tag}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--shield-text-dim)]">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[var(--shield-emerald-bright)] opacity-0 transition group-hover:opacity-100">
                      <span>Launch Mission</span>
                      <Send className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Conversation Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onAction={markAction} />
          ))}
        </div>
      </div>

      {/* Floating Bottom Composer Dock (ChatGPT / Claude Canvas style) */}
      <div className="sticky bottom-0 z-20 px-4 pb-4 pt-2 sm:px-6 lg:px-8 bg-gradient-to-t from-[var(--shield-ink)] via-[var(--shield-ink)]/95 to-transparent">
        <div className="mx-auto max-w-3xl">
          {/* Quick Tool Selector Pills */}
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--shield-text-faint)] shrink-0">
              Tool Accelerators:
            </span>
            {[
              { label: "🎯 France Travail", prompt: "Search France Travail for verified internships matching my course." },
              { label: "🛡️ Statutory 964h", prompt: "Explain Article R5221-26 964-hour rule and convention de stage exemption." },
              { label: "✉️ Draft Outreach", prompt: "Draft a professional contact email to a lab researcher in Paris." },
              { label: "📋 CV Dossier", prompt: "Prepare European CV tailoring guidelines and work authorization clauses." },
            ].map((tool, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => void send(tool.prompt)}
                disabled={sending}
                className="shrink-0 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--shield-text-dim)] transition hover:border-[var(--shield-emerald-bright)] hover:text-white"
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* Composer Capsule */}
          <div className="as-composer-capsule rounded-2xl p-2 sm:p-2.5">
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
                placeholder="Ask AbroadShield to search roles, audit statutory rules, or draft materials…"
                className="as-scroll max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-[var(--shield-text)] placeholder:text-[var(--shield-text-dim)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void send(input)}
                disabled={!input.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--shield-emerald)] text-black font-bold transition hover:bg-[var(--shield-emerald-bright)] disabled:opacity-20 disabled:hover:bg-[var(--shield-emerald)]"
                aria-label="Send message"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 fill-current" />}
              </button>
            </div>

            <div className="mt-1.5 flex items-center justify-between px-2 text-[10px] text-[var(--shield-text-faint)]">
              <span>Enter to send · Shift+Enter for newline</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--shield-emerald-bright)]">
                Autonomous Statutory Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
