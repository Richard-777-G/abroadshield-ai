"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Shield, Sparkles, Chrome, Loader2 } from "lucide-react";

interface Props { open: boolean; onClose: () => void; mode?: "login" | "signup"; }
type Providers = Record<string, { id: string; name: string; type: string }>;

export default function AuthModal({ open, onClose, mode: initialMode = "signup" }: Props) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<Providers>({});

  useEffect(() => { if (open) void fetch("/api/auth/providers", { cache: "no-store" }).then(r => r.ok ? r.json() : {}).then(setProviders).catch(() => setProviders({})); }, [open]);
  useEffect(() => { setMode(initialMode); }, [initialMode]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) { setError("Email and password are required."); return; }
    if (mode === "signup" && (name.trim().length < 2 || password.length < 8)) { setError("Use your name and a password of at least 8 characters."); return; }
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        const register = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password }) });
        const data = await register.json().catch(() => ({}));
        if (!register.ok || !data.ok) { setError(data.error || "Could not create your account."); return; }
      }
      const res = await signIn("credentials", { email: normalizedEmail, password, redirect: false, callbackUrl: "/#dashboard" });
      if (!res || res.error) { setError("Email or password is incorrect."); return; }
      onClose();
      window.location.hash = "#dashboard";
      window.location.reload();
    } catch { setError("Authentication is temporarily unavailable. Please try again."); }
    finally { setLoading(false); }
  };

  const handleOAuth = (provider: string) => { setLoading(true); setError(""); void signIn(provider, { callbackUrl: "/#dashboard" }); };
  const hasGoogle = Boolean(providers.google);
  const hasGitHub = Boolean(providers.github);

  return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[oklch(0.11_0.015_165/0.8)] backdrop-blur-md" onClick={onClose} />
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[oklch(0.74_0.17_162/0.3)] as-glass-strong">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[oklch(0.74_0.17_162/0.2)] blur-3xl" />
      <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]"><X className="h-4 w-4" /></button>
      <div className="relative p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center"><span className="relative mb-3 flex h-12 w-12 items-center justify-center"><span className="absolute inset-0 rounded-xl bg-[oklch(0.74_0.17_162/0.2)] blur-md" /><span className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]"><Shield className="h-6 w-6 text-[oklch(0.85_0.19_158)]" /></span></span><h2 className="text-xl font-semibold text-[var(--shield-text)]">{mode === "signup" ? "Start your journey" : "Welcome back"}</h2><p className="mt-1 text-xs text-[var(--shield-text-dim)]">{mode === "signup" ? "One AI. One memory. Four phases, start to finish." : "Your agent is exactly where you left it."}</p></div>
        {(hasGoogle || hasGitHub) && <><div className="mb-5 grid grid-cols-2 gap-2">
          {hasGoogle && <button disabled={loading} onClick={() => handleOAuth("google")} className="flex items-center justify-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] py-2.5 text-xs font-medium text-[var(--shield-text)] transition hover:border-[oklch(0.74_0.17_162/0.4)] disabled:opacity-50"><Chrome className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />Google</button>}
          {hasGitHub && <button disabled={loading} onClick={() => handleOAuth("github")} className="flex items-center justify-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] py-2.5 text-xs font-medium text-[var(--shield-text)] transition hover:border-[oklch(0.74_0.17_162/0.4)] disabled:opacity-50"><span className="text-base">⌘</span>GitHub</button>}
        </div><div className="mb-4 flex items-center gap-3"><div className="h-px flex-1 bg-[var(--shield-border)]" /><span className="text-[10px] uppercase tracking-wider text-[var(--shield-text-dim)]">or</span><div className="h-px flex-1 bg-[var(--shield-border)]" /></div></>}
        <form className="space-y-3" onSubmit={handleCredentials}>
          {mode === "signup" && <div><label className="mb-1 block text-[11px] font-medium text-[var(--shield-text-dim)]">Full name</label><div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shield-text-dim)]" /><input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Your name" className="w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.18_0.022_165/0.6)] py-2.5 pl-10 pr-3 text-sm text-[var(--shield-text)] placeholder:text-[var(--shield-text-dim)] focus:border-[oklch(0.74_0.17_162/0.5)] focus:outline-none" /></div></div>}
          <div><label className="mb-1 block text-[11px] font-medium text-[var(--shield-text-dim)]">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shield-text-dim)]" /><input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.18_0.022_165/0.6)] py-2.5 pl-10 pr-3 text-sm text-[var(--shield-text)] placeholder:text-[var(--shield-text-dim)] focus:border-[oklch(0.74_0.17_162/0.5)] focus:outline-none" /></div></div>
          <div><label className="mb-1 block text-[11px] font-medium text-[var(--shield-text-dim)]">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shield-text-dim)]" /><input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="At least 8 characters" className="w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.18_0.022_165/0.6)] py-2.5 pl-10 pr-3 text-sm text-[var(--shield-text)] placeholder:text-[var(--shield-text-dim)] focus:border-[oklch(0.74_0.17_162/0.5)] focus:outline-none" /></div></div>
          {error && <p className="text-xs text-[oklch(0.66_0.19_22)]">{error}</p>}
          <button type="submit" disabled={loading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.98_0.005_160)] py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-white disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />}{mode === "signup" ? "Create account & launch agent" : "Sign in"}</button>
        </form>
        <p className="mt-4 text-center text-xs text-[var(--shield-text-dim)]">{mode === "signup" ? "Already have an account?" : "New to AbroadShield?"}{" "}<button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }} className="font-semibold text-[oklch(0.85_0.19_158)] hover:underline">{mode === "signup" ? "Sign in" : "Create one"}</button></p>
        <p className="mt-3 text-center text-[10px] text-[var(--shield-text-faint)]">Your account securely stores your journey and agent state.</p>
      </div>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
