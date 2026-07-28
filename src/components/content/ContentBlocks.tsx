import Image from "next/image";
import { Fragment } from "react";

/** Ordered content blocks migrated from WordPress/Elementor pages. */
export type ContentBlock = {
  type: string; // h1..h6, p, li, blockquote, img
  text?: string;
  src?: string;
  alt?: string;
  localSrc?: string;
};

function TextWithBreaks({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

const headingStyles: Record<string, string> = {
  h1: "font-[family-name:var(--font-display)] mt-12 text-3xl sm:text-4xl font-semibold text-kelp-900",
  h2: "font-[family-name:var(--font-display)] mt-12 text-2xl sm:text-3xl font-semibold text-kelp-900",
  h3: "font-[family-name:var(--font-display)] mt-8 text-xl sm:text-2xl font-semibold text-kelp-900",
  h4: "font-[family-name:var(--font-display)] mt-6 text-lg font-semibold text-kelp-900",
  h5: "mt-6 text-base font-bold text-kelp-900",
  h6: "mt-6 text-sm font-bold uppercase tracking-wider text-kelp-800",
};

export function ContentBlocks({
  blocks,
  /** Migrated images frequently carry no alt; describe them by page context
      rather than shipping empty alt text on meaningful content images. */
  fallbackAlt = "",
}: {
  blocks: ContentBlock[];
  fallbackAlt?: string;
}) {
  const rendered: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    rendered.push(
      <ul key={key} className="my-4 list-disc space-y-1.5 pl-6 text-ink/80">
        {listBuffer.map((item, i) => (
          <li key={i}>
            <TextWithBreaks text={item} />
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  blocks.forEach((b, i) => {
    if (b.type === "li") {
      listBuffer.push(b.text ?? "");
      return;
    }
    flushList(`list-${i}`);

    if (b.type === "img" && (b.localSrc || b.src)) {
      rendered.push(
        <Image
          key={i}
          src={b.localSrc ?? b.src!}
          alt={b.alt || fallbackAlt}
          width={960}
          height={640}
          sizes="(max-width: 768px) 100vw, 768px"
          className="my-8 h-auto w-full rounded-3xl object-cover shadow-sm ring-1 ring-sand-200"
        />,
      );
      return;
    }

    if (b.type.startsWith("h")) {
      // demote h1s from the migrated markup — the page template renders the single H1
      const tag = b.type === "h1" ? "h2" : b.type;
      const Tag = tag as "h2" | "h3" | "h4" | "h5" | "h6";
      rendered.push(
        <Tag key={i} className={headingStyles[b.type] ?? headingStyles.h4}>
          <TextWithBreaks text={b.text ?? ""} />
        </Tag>,
      );
      return;
    }

    if (b.type === "blockquote") {
      rendered.push(
        <blockquote key={i} className="my-6 border-l-4 border-gold-500 pl-5 italic text-ink/70">
          <TextWithBreaks text={b.text ?? ""} />
        </blockquote>,
      );
      return;
    }

    if (b.text) {
      rendered.push(
        <p key={i} className="my-4 leading-relaxed text-ink/80">
          <TextWithBreaks text={b.text} />
        </p>,
      );
    }
  });
  flushList("list-final");

  return <div className="max-w-3xl">{rendered}</div>;
}
