import type { ReactNode } from "react";
import { Container } from "./Container";

type SectionProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  align?: "left" | "center";
  tone?: "sand" | "cream" | "kelp";
  className?: string;
  children: ReactNode;
  id?: string;
};

const tones = {
  sand: "bg-sand-50",
  cream: "bg-sand-100",
  kelp: "bg-kelp-900 text-sand-50",
};

export function Section({ eyebrow, title, lead, align = "center", tone = "sand", className = "", children, id }: SectionProps) {
  const dark = tone === "kelp";
  return (
    <section id={id} className={`py-16 sm:py-24 ${tones[tone]} ${className}`}>
      <Container>
        {(eyebrow || title || lead) && (
          <div className={`mb-10 sm:mb-14 max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
            {eyebrow && (
              <p className={`mb-3 text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-gold-300" : "text-gold-600"}`}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={`font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold ${dark ? "text-sand-50" : "text-kelp-900"}`}
              >
                {title}
              </h2>
            )}
            {lead && <p className={`mt-4 text-base sm:text-lg ${dark ? "text-sand-200/90" : "text-ink/70"}`}>{lead}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
