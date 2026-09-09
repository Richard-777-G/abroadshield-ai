"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plug, Briefcase, Mail, Home, GraduationCap, Plane, CreditCard, Smartphone, ExternalLink, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import Reveal from "./Reveal";

const CONNECTORS = [
  { id: "gmail", name: "Gmail", category: "email", url: "https://mail.google.com", description: "Draft and send approved emails through your Google account.", status: "oauth" },
  { id: "outlook", name: "Outlook", category: "email", url: "https://outlook.com", description: "External provider. No Outlook connector is enabled yet.", status: "external" },
  { id: "linkedin", name: "LinkedIn", category: "jobs", url: "https://linkedin.com", description: "External provider. Job and outreach actions require a supported integration.", status: "external" },
  { id: "indeed", name: "Indeed", category: "jobs", url: "https://indeed.com", description: "External provider. Live job search is not claimed until a search connector is available.", status: "external" },
  { id: "glassdoor", name: "Glassdoor", category: "jobs", url: "https://glassdoor.com", description: "External provider. Open the service to review roles and company information.", status: "external" },
  { id: "handshake", name: "Handshake", category: "jobs", url: "https://joinhandshake.com", description: "External provider. University career data is not connected yet.", status: "external" },
  { id: "rightmove", name: "Rightmove", category: "housing", url: "https://rightmove.co.uk", description: "External provider. Live listings require a supported search connector.", status: "external" },
  { id: "spareroom", name: "SpareRoom", category: "housing", url: "https://spareroom.co.uk", description: "External provider. Viewing messages require a supported integration.", status: "external" },
  { id: "zoopla", name: "Zoopla", category: "housing", url: "https://zoopla.co.uk", description: "External provider. Live property search is not claimed yet.", status: "external" },
  { id: "ucas", name: "UCAS", category: "education", url: "https://ucas.com", description: "External provider. Application data is not connected yet.", status: "external" },
  { id: "university", name: "University Portal", category: "education", url: "#", description: "Your university portal can be used externally; no generic portal connector is enabled.", status: "external" },
  { id: "skyscanner", name: "Skyscanner", category: "travel", url: "https://skyscanner.com", description: "External provider. Live flight monitoring requires a supported integration.", status: "external" },
  { id: "wise", name: "Wise", category: "finance", url: "https://wise.com", description: "External provider. Financial account access is not enabled.", status: "external" },
  { id: "revolut", name: "Revolut", category: "finance", url: "https://revolut.com", description: "External provider. Financial account access is not enabled.", status: "external" },
  { id: "whatsapp", name: "WhatsApp", category: "apps", url: "https://whatsapp.com", description: "External provider. Proactive messaging is not connected yet.", status: "external" },
  { id: "notion", name: "Notion", category: "apps", url: "https://notion.so", description: "External provider. Workspace sync is not connected yet.", status: "external" },
] as const;
const CATEGORIES = ["all", "jobs", "email", "housing", "education", "travel", "finance", "apps"] as const;

export default function Connectors() {
  const { status: authStatus } = useSession();
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("all");
  const [gmailConnected, setGmailConnected] = useState(false);
  const [loadingGmail, setLoadingGmail] = useState(false);
  const loadGmailStatus = async () => {
    if (authStatus !== "authenticated") return;
    try { const response = await fetch("/api/integrations/gmail", { cache: "no-store" }); const data = await response.json(); setGmailConnected(Boolean(data.connected)); } catch { setGmailConnected(false); }
  };
  useEffect(() => { void loadGmailStatus(); }, [authStatus]);
  const visible = useMemo(() => filter === "all" ? CONNECTORS : CONNECTORS.filter(c => c.category === filter), [filter]);
  const connectGmail = async () => { setLoadingGmail(true); try { await signIn("google", { callbackUrl: `${window.location.origin}/#connectors` }); } finally { setLoadingGmail(false); } };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8 pb-16">
      <Reveal className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.18em] text-[var(--shield-emerald-bright)]">
          <Plug className="h-3.5 w-3.5" />
          <span>Verified Integrations &amp; Connectors</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Connect the tools the agent can actually operate.
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-[var(--shield-text-dim)] sm:text-sm">
          Connected means authenticated and usable. External means the platform can be opened, but AbroadShield does not claim direct access.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                filter === category
                  ? "border-[oklch(0.76_0.18_160/0.7)] bg-[oklch(0.76_0.18_160/0.15)] text-white shadow-sm"
                  : "border-[var(--shield-border)] bg-[var(--shield-ink-2)] text-[var(--shield-text-dim)] hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((connector, index) => {
            const connected = connector.id === "gmail" && gmailConnected;
            return (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.25, delay: index * 0.02 }}
                className="flex flex-col justify-between rounded-3xl border border-[var(--shield-border)] bg-[linear-gradient(180deg,oklch(0.16_0.02_255/0.95),oklch(0.12_0.015_255/0.98))] p-5 shadow-xl transition hover:border-[oklch(0.76_0.18_160/0.4)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--shield-border)] bg-[oklch(0.76_0.18_160/0.1)] text-[var(--shield-emerald-bright)]">
                      {connector.category === "jobs" ? <Briefcase className="h-4 w-4" /> :
                        connector.category === "email" ? <Mail className="h-4 w-4" /> :
                        connector.category === "housing" ? <Home className="h-4 w-4" /> :
                        connector.category === "education" ? <GraduationCap className="h-4 w-4" /> :
                        connector.category === "travel" ? <Plane className="h-4 w-4" /> :
                        connector.category === "finance" ? <CreditCard className="h-4 w-4" /> :
                        <Smartphone className="h-4 w-4" />}
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wide ${
                      connected
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                        : "border-[var(--shield-border)] text-[var(--shield-text-faint)]"
                    }`}>
                      {connected ? "Connected" : connector.status === "oauth" ? "OAuth Available" : "External Portal"}
                    </span>
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-white">{connector.name}</h2>
                  <p className="mt-1.5 min-h-12 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                    {connector.description}
                  </p>
                </div>

                {connector.id === "gmail" ? (
                  <button
                    type="button"
                    onClick={connectGmail}
                    disabled={loadingGmail || connected}
                    className="as-public-button-primary mt-4 w-full rounded-xl py-2 text-xs font-bold disabled:opacity-50"
                  >
                    {connected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    <span>{connected ? "Gmail Connected" : loadingGmail ? "Connecting…" : "Connect Gmail"}</span>
                  </button>
                ) : (
                  <a
                    href={connector.url === "#" ? undefined : connector.url}
                    target={connector.url === "#" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-disabled={connector.url === "#"}
                    className={`as-public-button-secondary mt-4 w-full rounded-xl py-2 text-xs font-semibold ${
                      connector.url === "#" ? "cursor-not-allowed opacity-40" : "hover:text-white"
                    }`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open {connector.name}</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </Reveal>

      <div className="mt-8 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-4 text-center text-xs text-[var(--shield-text-dim)]">
        <ShieldCheck className="mr-1.5 inline h-4 w-4 text-[var(--shield-emerald-bright)]" />
        Approval remains strictly required before outbound actions. No connector is presented as active unless verified.
      </div>
    </div>
  );
}
