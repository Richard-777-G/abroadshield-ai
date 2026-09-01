import { Shield, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.13_0.018_165/0.85)] backdrop-blur-xl">
      {/* top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.5)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* brand block */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]">
                <Shield className="h-4.5 w-4.5 text-[oklch(0.85_0.19_158)]" />
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
              To be the one relationship every student going abroad can count on for the
              entire journey — not a tool used once and dropped, but a presence that grows
              more valuable the longer it stays with someone.
            </p>
            <div className="mt-5 flex gap-2">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#top"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] text-[var(--shield-text-dim)] transition hover:border-[oklch(0.74_0.17_162/0.4)] hover:text-[oklch(0.85_0.19_158)]"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* journey links */}
          <FooterCol
            title="The journey"
            links={[
              { label: "Pre-Departure", href: "#journey" },
              { label: "Arrival", href: "#journey" },
              { label: "Studying & Part-Time", href: "#journey" },
              { label: "Job Success", href: "#journey" },
            ]}
          />

          {/* product links */}
          <FooterCol
            title="Product"
            links={[
              { label: "Talk to the agent", href: "#agent" },
              { label: "Memory vault", href: "#memory" },
              { label: "Country rules", href: "#countries" },
              { label: "Pricing", href: "#pricing" },
            ]}
          />

          {/* company links */}
          <FooterCol
            title="Built for"
            links={[
              { label: "Tier-2 & tier-3 towns", href: "#top" },
              { label: "Regional languages", href: "#top" },
              { label: "Slow connections", href: "#top" },
              { label: "First-in-family abroad", href: "#top" },
            ]}
          />
        </div>

        {/* divider */}
        <div className="my-8 h-px w-full bg-[var(--shield-border)]" />

        {/* bottom row */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-[var(--shield-text-dim)]">
            © {new Date().getFullYear()} AbroadShield AI · Built for every student, in
            every town, in the language they trust.
          </p>
          <p className="text-xs text-[var(--shield-text-dim)]">
            One AI · One memory · Four phases, start to finish.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)]">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-sm text-[var(--shield-text-dim)] transition hover:text-[var(--shield-text)]"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
