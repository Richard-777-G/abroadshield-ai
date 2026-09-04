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
import { CHAT_STARTERS } from "./data";
import Reveal from "./Reveal";
import { useApprovalsStore, type ApprovalKind } from "./approvalsStore";
import { useProfileStore } from "./profileStore";

type DraftAction = "none" | "approved" | "edited" | "declined";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  action?: DraftAction;
}

function isDraftMessage(content: string): boolean {
  if (!content) return false;
  const lower = content.toLowerCase();
  const hasApproveCue = lower.includes("approve to send") || lower.includes("approve / edit / decline") || lower.includes("approve/edit/decline") || lower.includes("approve · edit · decline");
  const hasDraftSignal = /^subject:/im.test(content) || /^dear\b/im.test(content) || /```/.test(content);
  return hasApproveCue || hasDraftSignal;
}

function buildWelcome(profile: import("./profileStore").StudentProfile): Message {
  const name = profile.name || "there";
  const route = [profile.origin, profile.destination].filter(Boolean).join(" → ");
  const study = [profile.course, profile.university].filter(Boolean).join(" · ");
  const context = [route, study, profile.intake ? profile.intake + " intake" : "", "Current phase: " + profile.currentPhase.replaceAll("-", " ")].filter(Boolean).join(" · ");
  return { id: "welcome", role: "assistant", content: "Hi **" + name + "** — I’m your AbroadShield agent. " + (context ? "I have your journey context: **" + context + "**. " : "") + "I’ll carry that context across the journey.\n\nAsk me to **draft**, **check**, **shortlist**, or **explain**. I’ll prepare the work and hand it to you to review and approve." };
}

function getAgentError(data: unknown, status: number): string {
  const error = data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string" ? (data as { error: string }).error : "";
  if (status === 403 && /credit card|billing|credits/i.test(error)) return "The agent is connected correctly, but the AI provider is currently blocked by account billing. Add a valid payment method/AI Gateway credits in Vercel, then retry. No task was falsely marked complete.";
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

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, sending]);
  useEffect(() => { const handler = (e: Event) => { const prompt = (e as CustomEvent<string>).detail; if (prompt) { setInput(prompt); setTimeout(() => inputRef.current?.focus(), 100); } }; window.addEventListener("abroadshield:prefill-chat", handler); return () => window.removeEventListener("abroadshield:prefill-chat", handler); }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    const pendingMsg: Message = { id: `a-${Date.now()}`, role: "assistant", content: "", pending: true };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, userMsg, pendingMsg]); setInput(""); setSending(true);
    try {
      const res = await fetch("/api/abroadshield/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: trimmed, messages: history }) });
      const data = await res.json().catch(() => null);
      const reply = data?.ok && typeof data.reply === "string" ? data.reply : getAgentError(data, res.status);
      setMessages((m) => m.map((msg) => msg.id === pendingMsg.id ? { ...msg, content: reply, pending: false } : msg));
    } catch {
      setMessages((m) => m.map((msg) => msg.id === pendingMsg.id ? { ...msg, content: "Network error reaching the agent. Check your connection and retry.", pending: false } : msg));
    } finally { setSending(false); inputRef.current?.focus(); }
  };

  const reset = () => { setMessages([buildWelcome(profile)]); setInput(""); };
  const addEntry = useApprovalsStore((s) => s.addEntry);
  const markAction = (id: string, action: DraftAction) => { setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, action } : msg))); if (action === "none") return; const msg = messages.find((m) => m.id === id); if (!msg || msg.role !== "assistant") return; const meta = extractDraftMeta(msg.content); addEntry({ action, kind: meta.kind, title: meta.title, recipient: meta.recipient, detail: meta.detail, phase: meta.phase }); };

  return <section id="agent" className="relative w-full bg-transparent py-6 sm:py-8"><div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8"><Reveal className="mb-7"><div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.08)] px-3 py-1 text-[11px] font-medium tracking-wide text-[oklch(0.85_0.19_158)]"><Sparkles className="h-3 w-3"/>Talk to the actual agent · live model</div><h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">Ask it <span className="as-text-gradient">to do the work.</span></h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--shield-text-dim)]">The agent carries your journey context and returns drafts, checks and shortlists for review and approval.</p></Reveal><div className="overflow-hidden rounded-2xl border border-[var(--shield-border)] as-glass-strong"><div className="relative flex items-center justify-between border-b border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-5 py-3.5"><div className="relative flex items-center gap-3"><div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]"><img src="/sections/agent-avatar.png" alt="AI agent" className="h-full w-full object-cover" loading="lazy"/><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[oklch(0.22_0.025_165)] bg-[oklch(0.74_0.17_162)] as-pulse"/></div><div><div className="text-sm font-semibold text-[var(--shield-text)]">AbroadShield Agent</div><div className="text-[11px] text-[var(--shield-text-dim)]">{profile.name ? `Carrying ${profile.name}&apos;s journey context` : "Ready for your journey context"} · {profile.currentPhase.replaceAll("-", " ")}</div></div></div><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-3 py-1.5 text-[11px] font-medium text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]"><RotateCcw className="h-3 w-3"/>Reset</button></div><div ref={scrollRef} className="as-scroll max-h-[460px] min-h-[340px] space-y-4 overflow-y-auto bg-[oklch(0.14_0.018_165)/0.5)] p-5 sm:p-6">{messages.map((m) => <MessageBubble key={m.id} message={m} onAction={markAction}/>)}</div>{messages.length<=1&&<div className="border-t border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] px-5 py-4 sm:px-6"><div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--shield-text-dim)]">Try one</div><div className="flex flex-wrap gap-2">{CHAT_STARTERS.map((s)=><button type="button" key={s.label} onClick={()=>void send(s.prompt)} disabled={sending} className="rounded-full border border-[oklch(0.74_0.17_162/0.35)] bg-[oklch(0.74_0.17_162/0.08)] px-3 py-1.5 text-xs font-medium text-[oklch(0.85_0.19_158)] transition hover:border-[oklch(0.74_0.17_162/0.6)] disabled:opacity-50">{s.label}</button>)}</div></div>}<div className="border-t border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] p-3 sm:p-4"><div className="flex items-end gap-2"><textarea ref={inputRef} value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send(input);}}} rows={1} placeholder="Draft me an email to the consulate…" className="as-scroll max-h-32 flex-1 resize-none rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)/0.7)] px-4 py-3 text-sm text-[var(--shield-text)] placeholder:text-[var(--shield-text-dim)] focus:border-[oklch(0.74_0.17_162/0.5)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.74_0.17_162/0.4)]"/><button type="button" onClick={()=>void send(input)} disabled={!input.trim()||sending} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.74_0.17_162)] text-[oklch(0.14_0.018_165)] transition hover:bg-[oklch(0.85_0.19_158)] disabled:opacity-40 as-glow-emerald" aria-label="Send">{sending?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}</button></div><div className="mt-2 px-1 text-[10px] text-[var(--shield-text-dim)]">Enter to send · Shift+Enter for a new line · The agent never sends anything without your approval.</div></div></div></div></section>;
}

function MessageBubble({ message, onAction }: { message: Message; onAction: (id: string, action: DraftAction) => void; }) {
  const isUser = message.role === "user"; const [copied,setCopied]=useState(false); const isDraft=!isUser&&!message.pending&&isDraftMessage(message.content); const showActions=isDraft&&(!message.action||message.action==="none"); const actionTaken=message.action&&message.action!=="none";
  const copy=async()=>{try{await navigator.clipboard.writeText(message.content);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{}};
  return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.25}} className={`flex gap-3 ${isUser?"flex-row-reverse":""}`}><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${isUser?"border-[oklch(0.5_0.04_200/0.3)] bg-[oklch(0.24_0.028_165/0.7)]":"border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]"}`}>{isUser?<User className="h-4 w-4 text-[var(--shield-text-dim)]"/>:<Bot className="h-4 w-4 text-[oklch(0.85_0.19_158)]"/>}</div><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser?"bg-[oklch(0.24_0.028_165/0.8)] text-[var(--shield-text)]":"border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.7)] text-[var(--shield-text)]"}`}>{message.pending?<div className="flex items-center gap-1.5 py-0.5"><span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.74_0.17_162)]"/><span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.74_0.17_162)]"/><span className="as-typing-dot h-2 w-2 rounded-full bg-[oklch(0.74_0.17_162)]"/><span className="ml-2 text-xs text-[var(--shield-text-dim)]">the agent is working…</span></div>:isUser?<span className="whitespace-pre-wrap">{message.content}</span>:<><div className="prose prose-sm prose-invert max-w-none [&_a]:text-[oklch(0.85_0.19_158)] [&_a]:underline [&_code]:rounded [&_code]:bg-[oklch(0.14_0.018_165)/0.8)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[oklch(0.86_0.17_80)] [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--shield-border)] [&_pre]:bg-[oklch(0.14_0.018_165)/0.8)] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0"><ReactMarkdown>{message.content}</ReactMarkdown></div>{isDraft&&<div className="mt-3 border-t border-[var(--shield-border)] pt-3"><div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--shield-text-faint)]">Review before sending</div>{showActions&&<div className="flex flex-wrap gap-2"><button type="button" onClick={()=>onAction(message.id,"approved")} className="inline-flex items-center gap-1.5 rounded-lg bg-[oklch(0.74_0.17_162)] px-3 py-2 text-[10px] font-semibold text-[oklch(0.14_0.018_165)]"><Check className="h-3 w-3"/>Approve</button><button type="button" onClick={()=>onAction(message.id,"edited")} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--shield-border)] px-3 py-2 text-[10px] text-[var(--shield-text-dim)]"><Pencil className="h-3 w-3"/>Edit</button><button type="button" onClick={()=>onAction(message.id,"declined")} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--shield-border)] px-3 py-2 text-[10px] text-[var(--shield-text-dim)]"><X className="h-3 w-3"/>Decline</button></div>}{actionTaken&&<div className="text-[10px] text-[var(--shield-text-faint)]">Action recorded: {message.action}</div>}</div>}{!isUser&&<div className="mt-2 flex items-center gap-2"><button type="button" onClick={copy} className="inline-flex items-center gap-1 text-[10px] text-[var(--shield-text-faint)] hover:text-[var(--shield-text-dim)]">{copied?<CheckCheck className="h-3 w-3"/>:<Copy className="h-3 w-3"/>}{copied?"Copied":"Copy"}</button></div>}</>}</div></motion.div>;
}

function extractDraftMeta(content: string): { kind: ApprovalKind; title: string; recipient?: string; detail: string; phase: string } {
  const subject = content.match(/^subject:\s*(.+)$/im)?.[1]?.trim();
  const recipient = content.match(/(?:to|recipient):\s*([^\n]+)/i)?.[1]?.trim();
  return { kind: "email", title: subject || "Agent draft", recipient, detail: content.slice(0, 2000), phase: "" };
}
