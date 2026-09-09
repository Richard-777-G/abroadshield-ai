"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SiteHeader from "@/components/abroadshield/SiteHeader";
import SiteFooter from "@/components/abroadshield/SiteFooter";
import Hero3D from "@/components/abroadshield/Hero3D";
import HomeShowcase from "@/components/abroadshield/HomeShowcase";
import AuthModal from "@/components/abroadshield/AuthModal";

type AuthMode = "login" | "signup";

const PUBLIC_VIEWS = [
  { id: "overview", label: "Overview" },
  { id: "lifecycle", label: "How it works" },
  { id: "architecture", label: "Architecture" },
  { id: "gateways", label: "Verified Gateways" },
];

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [activeSection, setActiveSection] = useState("overview");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");

  const requestAuth = useCallback((mode: AuthMode = "signup") => {
    setAuthMode(mode);
    setShowAuth(true);
  }, []);

  const navigateTo = useCallback(
    (target: string) => {
      if (target === "agent" || target === "workspace" || target.startsWith("/app")) {
        if (status === "authenticated") {
          router.push("/app");
        } else {
          requestAuth("login");
        }
        return;
      }

      if (target === "overview" || target === "home") {
        setActiveSection("overview");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const elementId =
        target === "journey" || target === "lifecycle"
          ? "lifecycle"
          : target === "architecture" || target === "pillars"
          ? "architecture"
          : target === "gateways" || target === "countries" || target === "pricing"
          ? "gateways"
          : target;

      const el = document.getElementById(elementId);
      if (el) {
        setActiveSection(target);
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router, status, requestAuth]
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      <SiteHeader
        activeView={activeSection}
        onViewChange={navigateTo}
        views={PUBLIC_VIEWS}
        onTryAgent={() => {
          if (status === "authenticated") {
            router.push("/app");
          } else {
            requestAuth("signup");
          }
        }}
        onAuthRequest={requestAuth}
      />
      <main className="flex-1">
        <Hero3D onNavigate={navigateTo} />
        <HomeShowcase onNavigate={navigateTo} />
      </main>
      <SiteFooter onNavigate={navigateTo} />
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        mode={authMode}
      />
    </div>
  );
}
