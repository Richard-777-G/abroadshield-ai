import { Shield, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.13_0.018_165/0.85)] backdrop-blur-xl">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.5)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]">
                <Shield className="h-4.5 w-4.5 text-[oklch(0.85_0.19_158)]" aria-hidden="true" />
              </span>
              <div className="leading-none">
                <div className="text-sm font-semibold tracking-tight text-[var(--shield-text)]">
                  AbroadShield
                  <span className="ml-1 text-[oklch(0.74_0.17_162)]">AI</span>
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-[var(--shield-text-dim)]">
                  One agent · four phases
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--shield-text-dim)]">
              One relationship for the full international-student journey — from planning and departure through arrival, study, work, and the transition into a career.
            </p>
            <div className="mt-5 flex gap-2">
              <SocialLink href="https://github.com/Richard-777-G/abroadshield-ai" label="GitHub"><Github className="h-4 w-4" /></SocialLink>
              <SocialLink href="#top" label="X / Twitter"><Twitter className="h-4 w-4" /></SocialLink>
              <SocialLink href="#top" label="LinkedIn"><Linkedin className="h-4 w-4" /></SocialLink>
              <SocialLink href="mailto:hello@abroadshield.ai" label="Email"><Mail className="h-4 w-4" /></SocialLink>
            </div>
          </div>

          <FooterCol title="The journey" links={[
            { label: "Pre-Departure", href: "#journey" },
            { label: "Arrival", href: "#journey" },
            { label: "Study & Part-Time", href: "#journey" },
            { label: "Career Transition", href: "#journey" },
          ]} />

          <FooterCol title="Product" links={[
            { label: "Talk to the agent", href: "#agent" },
            { label: "Memory", href: "#agent" },
            { label: "Country rules", href: "#countries" },
            { label: "Pricing", href: "#pricing" },
          ]} />

          <FooterCol title="Designed for" links={[
            { label: "First-time international students", href: "#top" },
            { label: "Regional-language users", href: "#top" },
            { label: "Lower-bandwidth environments", href: "#top" },
            { label: "Students without family abroad", href: "#top" },
          ]} />
        </div>

        <div className="my-8 h-px w-full bg-[var(--shield-border)]" />

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-[var(--shield-text-dim)]">
            © {new Date().getFullYear()} AbroadShield AI · Built for students, wherever they start.
          </p>
          <p className="text-xs text-[var(--shield-text-dim)]">
            One AI · One memory · Four phases, start to finish.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] text-[var(--shield-text-dim)] transition hover:border-[oklch(0.74_0.17_162/0.4)] hover:text-[oklch(0.85_0.19_158)]"
    >
      {children}
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)]">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-sm text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
