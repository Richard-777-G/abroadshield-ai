"use client";

import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Shield, Sparkles, Chrome, Loader2, ArrowRight, KeyRound } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  mode?: "login" | "signup";
}

type Providers = Record<string, { id: string; name: string; type: string }>;

export default function AuthModal({ open, onClose, mode: initialMode = "signup" }: Props) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<Providers>({});

  useEffect(() => {
    if (!open) return;
    setError("");
    void fetch("/api/auth/providers", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setProviders(data as Providers))
      .catch(() => setProviders({}));
  }, [open]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const normalizedEmail = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!normalizedEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }
    if (mode === "signup" && (name.length < 2 || password.length < 8)) {
      setError("Use your name and a password of at least 8 characters.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const register = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email: normalizedEmail, password }),
        });
        const data = await register.json().catch(() => ({}));
        if (!register.ok || !data.ok) {
          setError(data.error || "Could not create your account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl: "/#agent",
      });

      if (!result || result.error || result.ok === false) {
        setError("Email or password is incorrect.");
        return;
      }

      const session = await getSession();
      if (!session?.user?.email) {
        setError("Your credentials were accepted, but the session could not be established. Please try again.");
        return;
      }

      onClose();
      window.location.assign("/#agent");
    } catch {
      setError("Authentication is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    setLoading(true);
    setError("");
    void signIn(provider, { callbackUrl: "/#agent" });
  };

  const hasGoogle = Boolean(providers.google);
  const hasGitHub = Boolean(providers.github);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="as-dock relative w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] text-[var(--shield-text-dim)] transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6 flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[oklch(0.76_0.18_160/0.45)] bg-[oklch(0.76_0.18_160/0.12)]">
                <Shield className="h-6 w-6 text-[var(--shield-emerald-bright)]" />
              </span>
              <h2 className="mt-3 text-xl font-bold text-white">
                {mode === "signup" ? "Enter the Co-Pilot Workspace" : "Welcome Back"}
              </h2>
              <p className="mt-1 text-xs text-[var(--shield-text-dim)]">
                {mode === "signup"
                  ? "Launch your private AI agent and 8-stage journey context."
                  : "Your persistent journey memory is ready."}
              </p>
            </div>

            {/* OAuth buttons if available */}
            {(hasGoogle || hasGitHub) && (
              <>
                <div className="mb-5 grid grid-cols-2 gap-2">
                  {hasGoogle && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOAuth("google")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] py-2.5 text-xs font-semibold text-white transition hover:border-[oklch(0.76_0.18_160/0.5)] disabled:opacity-50"
                    >
                      <Chrome className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
                      Google
                    </button>
                  )}
                  {hasGitHub && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleOAuth("github")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] py-2.5 text-xs font-semibold text-white transition hover:border-[oklch(0.76_0.18_160/0.5)] disabled:opacity-50"
                    >
                      <span className="text-base">⌘</span>
                      GitHub
                    </button>
                  )}
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[var(--shield-border)]" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--shield-text-faint)]">
                    OR CREDENTIALS
                  </span>
                  <div className="h-px flex-1 bg-[var(--shield-border)]" />
                </div>
              </>
            )}

            <form className="space-y-3.5" onSubmit={handleCredentials}>
              {mode === "signup" && (
                <div>
                  <label
                    className="mb-1 block text-[11px] font-medium text-[var(--shield-text-dim)]"
                    htmlFor="auth-name"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shield-text-faint)]" />
                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="e.g. Richard G."
                      className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-[var(--shield-text-faint)] focus:border-[oklch(0.76_0.18_160/0.7)] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  className="mb-1 block text-[11px] font-medium text-[var(--shield-text-dim)]"
                  htmlFor="auth-email"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shield-text-faint)]" />
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="student@university.edu"
                    className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-[var(--shield-text-faint)] focus:border-[oklch(0.76_0.18_160/0.7)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1 block text-[11px] font-medium text-[var(--shield-text-dim)]"
                  htmlFor="auth-password"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shield-text-faint)]" />
                  <input
                    id="auth-password"
                    name="password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    minLength={mode === "signup" ? 8 : undefined}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-[var(--shield-text-faint)] focus:border-[oklch(0.76_0.18_160/0.7)] focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs text-[oklch(0.66_0.20_25)] font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="as-public-button-primary mt-3 flex w-full py-3 text-xs font-bold shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>{mode === "signup" ? "Create Account & Enter" : "Sign In to Workspace"}</span>
              </button>
            </form>

            <div className="mt-5 border-t border-[var(--shield-border)] pt-4 text-center text-xs text-[var(--shield-text-dim)]">
              {mode === "signup" ? "Already have an account?" : "New to AbroadShield?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setError("");
                }}
                className="font-bold text-[var(--shield-emerald-bright)] hover:underline"
              >
                {mode === "signup" ? "Sign in here" : "Create an account"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
