"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, RotateCcw, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CHAT_STARTERS, STUDENT } from "./data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
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

  return (
    <section
      id="agent"
      className="relative w-full scroll-mt-20 bg-[var(--shield-ink)] py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.15_165/0.4)] to-transparent" />
      <div className="pointer-events-none absolute inset-0 as-radial-emerald opacity-50" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        {/* heading */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.72_0.15_165/0.4)] bg-[oklch(0.72_0.15_165/0.08)] px-3 py-1 text-[11px] font-medium tracking-wide text-[oklch(0.82_0.16_165)]">
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
        </div>

        {/* chat surface */}
        <div className="overflow-hidden rounded-3xl border border-[oklch(0.72_0.15_165/0.3)] as-glass-strong">
          {/* header */}
          <div className="flex items-center justify-between border-b border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.5)] px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.72_0.15_165/0.5)] bg-[oklch(0.72_0.15_165/0.12)]">
                <Bot className="h-4.5 w-4.5 text-[oklch(0.82_0.16_165)]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[oklch(0.21_0.025_220)] bg-[oklch(0.72_0.15_165)] as-pulse" />
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
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.5)] px-3 py-1.5 text-[11px] font-medium text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* messages */}
          <div
            ref={scrollRef}
            className="as-scroll max-h-[460px] min-h-[340px] space-y-4 overflow-y-auto bg-[oklch(0.16_0.02_220/0.5)] p-5 sm:p-6"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>

          {/* starters */}
          {messages.length <= 1 && (
            <div className="border-t border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.4)] px-5 py-4 sm:px-6">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--shield-text-dim)]">
                Try one
              </div>
              <div className="flex flex-wrap gap-2">
                {CHAT_STARTERS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => send(s.prompt)}
                    disabled={sending}
                    className="rounded-full border border-[oklch(0.72_0.15_165/0.35)] bg-[oklch(0.72_0.15_165/0.08)] px-3 py-1.5 text-xs font-medium text-[oklch(0.82_0.16_165)] transition hover:border-[oklch(0.72_0.15_165/0.6)] hover:bg-[oklch(0.72_0.15_165/0.15)] disabled:opacity-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* composer */}
          <div className="border-t border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.5)] p-3 sm:p-4">
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
                className="as-scroll max-h-32 flex-1 resize-none rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.16_0.02_220/0.7)] px-4 py-3 text-sm text-[var(--shield-text)] placeholder:text-[var(--shield-text-dim)] focus:border-[oklch(0.72_0.15_165/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.72_0.15_165/0.4)]"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || sending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.72_0.15_165)] text-[oklch(0.16_0.02_220)] transition hover:bg-[oklch(0.82_0.16_165)] disabled:opacity-40 disabled:hover:bg-[oklch(0.72_0.15_165)] as-glow-emerald"
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

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
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
            ? "border-[oklch(0.5_0.04_200/0.3)] bg-[oklch(0.27_0.03_220/0.7)]"
            : "border-[oklch(0.72_0.15_165/0.5)] bg-[oklch(0.72_0.15_165/0.12)]"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-[var(--shield-text-dim)]" />
        ) : (
          <Bot className="h-4 w-4 text-[oklch(0.82_0.16_165)]" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-[oklch(0.27_0.03_220/0.8)] text-[var(--shield-text)]"
            : "border border-[var(--shield-border)] bg-[oklch(0.21_0.025_220/0.7)] text-[var(--shield-text)]"
        }`}
      >
        {message.pending ? (
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.72_0.15_165)]" />
            <span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.72_0.15_165)]" />
            <span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.72_0.15_165)]" />
            <span className="ml-2 text-xs text-[var(--shield-text-dim)]">
              the agent is working…
            </span>
          </div>
        ) : isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none [&_a]:text-[oklch(0.82_0.16_165)] [&_a]:underline [&_code]:rounded [&_code]:bg-[oklch(0.16_0.02_220/0.8)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[oklch(0.82_0.16_70)] [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--shield-border)] [&_pre]:bg-[oklch(0.16_0.02_220/0.8)] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-[oklch(0.82_0.16_165)] [&_ul]:my-1.5 [&_li]:my-0.5 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3">
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
        )}
      </div>
    </motion.div>
  );
}
