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
    try { const response=await fetch("/api/integrations/gmail",{cache:"no-store"}); const data=await response.json(); setGmailConnected(Boolean(data.connected)); } catch { setGmailConnected(false); }
  };
  useEffect(()=>{void loadGmailStatus();},[authStatus]);
  const visible=useMemo(()=>filter==="all"?CONNECTORS:CONNECTORS.filter(c=>c.category===filter),[filter]);
  const connectGmail=async()=>{setLoadingGmail(true);try{await signIn("google",{callbackUrl:`${window.location.origin}/#connectors`});}finally{setLoadingGmail(false);}};

  return <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-7">
    <Reveal className="mb-7 max-w-3xl"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]"/><Plug className="h-3.5 w-3.5"/>Connectors & Integrations</div><h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">Connect the tools the agent can actually operate.</h1><p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)]">Connected means authenticated and usable. External means the platform can be opened, but AbroadShield does not claim direct access.</p></Reveal>
    <Reveal delay={0.05} className="mb-5"><div className="flex flex-wrap gap-1.5">{CATEGORIES.map(category=><button key={category} type="button" onClick={()=>setFilter(category)} aria-pressed={filter===category} className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${filter===category?"border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)] text-[oklch(0.85_0.19_158)]":"border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"}`}>{category}</button>)}</div></Reveal>
    <Reveal delay={0.1}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map((connector,index)=>{const connected=connector.id==="gmail"&&gmailConnected;return <motion.div key={connector.id} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-30px"}} transition={{duration:.25,delay:index*.02}} className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--shield-border)] bg-[oklch(0.74_0.17_162/0.08)]">{connector.category==="jobs"?<Briefcase className="h-4 w-4"/>:connector.category==="email"?<Mail className="h-4 w-4"/>:connector.category==="housing"?<Home className="h-4 w-4"/>:connector.category==="education"?<GraduationCap className="h-4 w-4"/>:connector.category==="travel"?<Plane className="h-4 w-4"/>:connector.category==="finance"?<CreditCard className="h-4 w-4"/>:<Smartphone className="h-4 w-4"/>}</div><span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${connected?"border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)] text-[oklch(0.85_0.19_158)]":"border-[var(--shield-border)] text-[var(--shield-text-faint)]"}`}>{connected?"Connected":connector.status==="oauth"?"Not connected":"External"}</span></div><h2 className="mt-4 text-sm font-semibold text-[var(--shield-text)]">{connector.name}</h2><p className="mt-1.5 min-h-12 text-xs leading-relaxed text-[var(--shield-text-dim)]">{connector.description}</p>{connector.id==="gmail"?<button type="button" onClick={connectGmail} disabled={loadingGmail||connected} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[oklch(0.74_0.17_162/0.35)] bg-[oklch(0.74_0.17_162/0.08)] px-3 py-2 text-xs font-semibold text-[oklch(0.85_0.19_158)] disabled:opacity-50">{connected?<CheckCircle2 className="h-3.5 w-3.5"/>:<ShieldCheck className="h-3.5 w-3.5"/>}{connected?"Gmail connected":loadingGmail?"Connecting…":"Connect Gmail"}</button>:<a href={connector.url==="#"?undefined:connector.url} target={connector.url==="#"?undefined:"_blank"} rel="noopener noreferrer" aria-disabled={connector.url==="#"} className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--shield-border)] px-3 py-2 text-xs font-semibold text-[var(--shield-text-dim)] ${connector.url==="#"?"cursor-not-allowed opacity-50":"hover:text-[var(--shield-text)]"}`}><ExternalLink className="h-3.5 w-3.5"/>Open {connector.name}<ArrowRight className="h-3 w-3"/></a>}</motion.div>})}</div></Reveal>
    <div className="mt-6 rounded-2xl border border-dashed border-[var(--shield-border)] p-4 text-center text-xs text-[var(--shield-text-dim)]"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5"/>Approval remains required before outbound actions. No connector is presented as active unless the application can verify it.</div>
  </div>;
}
