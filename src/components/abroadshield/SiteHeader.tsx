"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X, Zap, LogIn, LogOut, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import AuthModal from "./AuthModal";

interface NavItem { id: string; label: string; }
interface Props { activeView: string; onViewChange: (id: string) => void; views: NavItem[]; onTryAgent?: () => void; }

export default function SiteHeader({ activeView, onViewChange, views, onTryAgent }: Props) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = useCallback((id: string) => {
    onViewChange(id); setOpen(false); setProductOpen(false);
    if (typeof window !== "undefined") { history.replaceState(null, "", `#${id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }, [onViewChange]);

  const publicNav = views.filter((item) => ["home", "journey", "agent", "countries", "pricing"].includes(item.id));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div className={`mx-auto flex h-[60px] max-w-6xl items-center rounded-full border px-3 transition-all duration-500 sm:px-5 ${scrolled ? "border-[var(--shield-border)] bg-[oklch(0.11_0.015_165/0.94)] shadow-[0_18px_60px_-28px_oklch(0_0_0/0.9)] backdrop-blur-2xl" : "border-white/10 bg-[oklch(0.11_0.015_165/0.72)] backdrop-blur-xl"}`}>
          <button onClick={() => handleNav("home")} className="group flex shrink-0 items-center gap-2.5" aria-label="AbroadShield home">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.45)] bg-[oklch(0.74_0.17_162/0.1)] transition-transform duration-300 group-hover:scale-105"><span className="absolute inset-0 rounded-xl bg-[oklch(0.74_0.17_162/0.18)] blur-lg" /><Shield className="relative h-4 w-4 text-[oklch(0.85_0.19_158)]" /></span>
            <span className="text-[15px] font-semibold tracking-tight text-[var(--shield-text)]">AbroadShield<span className="text-[oklch(0.74_0.17_162)]"> AI</span></span>
          </button>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {publicNav.map((item) => <button key={item.id} onClick={() => handleNav(item.id)} className={`rounded-full px-3.5 py-2 text-[12.5px] font-medium transition ${activeView === item.id ? "text-[var(--shield-text)]" : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"}`}>{item.label}</button>)}
            <div className="relative">
              <button onClick={() => setProductOpen((v) => !v)} className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[12.5px] font-medium text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]" aria-expanded={productOpen}>Product <ChevronDown className={`h-3.5 w-3.5 transition-transform ${productOpen ? "rotate-180" : ""}`} /></button>
              <AnimatePresence>{productOpen && <motion.div initial={{ opacity: 0, y: 8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} className="absolute right-0 top-12 w-64 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.11_0.015_165/0.98)] p-2 shadow-2xl backdrop-blur-xl">
                <ProductLink title="How it works" detail="From profile to approved action" onClick={() => handleNav("home")} />
                <ProductLink title="Jobs & Network" detail="Career search and outreach" onClick={() => handleNav("network")} />
                <ProductLink title="Connections" detail="Services the agent can use" onClick={() => handleNav("connectors")} />
                <ProductLink title="Memory & rules" detail="Persistent context and country intelligence" onClick={() => handleNav("countries")} />
              </motion.div>}</AnimatePresence>
            </div>
          </nav>

          <div className="ml-2 hidden items-center gap-2 lg:flex">
            {session ? <><button onClick={() => handleNav("dashboard")} className="rounded-full border border-[oklch(0.74_0.17_162/0.28)] bg-[oklch(0.74_0.17_162/0.08)] px-3.5 py-2 text-[12px] font-semibold text-[oklch(0.85_0.19_158)]">Workspace</button><button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-full border border-[var(--shield-border)] px-3.5 py-2 text-[12px] font-medium text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]">Sign out</button></> : <><button onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="rounded-full px-3.5 py-2 text-[12.5px] font-medium text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]">Sign in</button><button onClick={() => onTryAgent ? onTryAgent() : (setAuthMode("signup"), setAuthOpen(true))} className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.98_0.005_160)] px-4 py-2 text-[12.5px] font-semibold text-[oklch(0.14_0.018_165)] transition hover:-translate-y-0.5 hover:bg-white"><Zap className="h-3.5 w-3.5" />Start with the agent</button></>}
          </div>

          <button onClick={() => setOpen((v) => !v)} className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--shield-border)] text-[var(--shield-text)] lg:hidden" aria-label="Open navigation">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>
      </header>
      <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-x-4 top-20 z-50 rounded-3xl border border-[var(--shield-border)] bg-[oklch(0.11_0.015_165/0.98)] p-3 shadow-2xl backdrop-blur-2xl lg:hidden">
        <nav className="space-y-1">{publicNav.map((item) => <button key={item.id} onClick={() => handleNav(item.id)} className="block w-full rounded-xl px-3 py-3 text-left text-sm text-[var(--shield-text-dim)] hover:bg-white/5 hover:text-[var(--shield-text)]">{item.label}</button>)}
          <div className="mt-2 border-t border-[var(--shield-border)] pt-2"><div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Product</div><button onClick={() => handleNav("network")} className="block w-full rounded-xl px-3 py-3 text-left text-sm text-[var(--shield-text-dim)]">Jobs & Network</button><button onClick={() => handleNav("connectors")} className="block w-full rounded-xl px-3 py-3 text-left text-sm text-[var(--shield-text-dim)]">Connections</button></div>
          <div className="grid grid-cols-2 gap-2 border-t border-[var(--shield-border)] pt-3"><button onClick={() => { setOpen(false); setAuthMode("login"); setAuthOpen(true); }} className="rounded-xl border border-[var(--shield-border)] px-4 py-3 text-sm font-medium">Sign in</button><button onClick={() => { setOpen(false); onTryAgent ? onTryAgent() : (setAuthMode("signup"), setAuthOpen(true)); }} className="rounded-xl bg-[oklch(0.98_0.005_160)] px-4 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Start with the agent</button></div>
        </nav></motion.div>}</AnimatePresence>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode={authMode} />
    </>
  );
}

function ProductLink({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return <button onClick={onClick} className="w-full rounded-xl p-3 text-left transition hover:bg-white/5"><div className="text-xs font-semibold text-[var(--shield-text)]">{title}</div><div className="mt-0.5 text-[10px] text-[var(--shield-text-faint)]">{detail}</div></button>;
}
