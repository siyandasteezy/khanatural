import { Fragment } from "react";

/**
 * Renders a migrated paragraph. The WordPress copy packs step-by-step and
 * bullet lists into single paragraphs ("1. …\n2. …", "• …", "a) …"); this
 * detects those and emits real list markup instead — better to scan, and
 * semantically correct for search engines. Wording is never altered.
 */
const NUMBERED = /^\s*\d+[.)]\s+/;
const LETTERED = /^\s*[a-z][.)]\s+/i;
const BULLETED = /^\s*[•·▪–-]\s+/;

type Segment =
  | { kind: "p"; text: string }
  | { kind: "ol" | "ul"; items: string[]; lettered?: boolean };

export function parseSegments(text: string): Segment[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const segments: Segment[] = [];
  let buffer: { kind: "ol" | "ul"; items: string[]; lettered?: boolean } | null = null;

  const flush = () => {
    if (buffer && buffer.items.length) segments.push(buffer);
    buffer = null;
  };

  for (const line of lines) {
    const isNumbered = NUMBERED.test(line);
    const isLettered = LETTERED.test(line) && !/^\s*a\s/i.test(line);
    const isBullet = BULLETED.test(line);

    if (isNumbered || isLettered || isBullet) {
      const kind: "ol" | "ul" = isBullet ? "ul" : "ol";
      const lettered = isLettered && !isNumbered;
      if (!buffer || buffer.kind !== kind || buffer.lettered !== lettered) {
        flush();
        buffer = { kind, items: [], lettered };
      }
      buffer.items.push(line.replace(NUMBERED, "").replace(LETTERED, "").replace(BULLETED, "").trim());
    } else {
      flush();
      segments.push({ kind: "p", text: line });
    }
  }
  flush();
  return segments;
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const segments = parseSegments(text);
  return (
    <div className={className}>
      {segments.map((seg, i) => {
        if (seg.kind === "p") {
          return (
            <p key={i} className="my-4 leading-relaxed text-ink/75">
              {seg.text}
            </p>
          );
        }
        if (seg.kind === "ul") {
          return (
            <ul key={i} className="my-5 space-y-2.5">
              {seg.items.map((item, j) => (
                <li key={j} className="flex gap-3 leading-relaxed text-ink/75">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <ol key={i} className="my-5 space-y-3" type={seg.lettered ? "a" : "1"}>
            {seg.items.map((item, j) => (
              <li key={j} className="flex gap-3 leading-relaxed text-ink/75">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kelp-900 text-[11px] font-bold text-sand-50"
                >
                  {seg.lettered ? String.fromCharCode(97 + j) : j + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}

export function TextWithBreaks({ text }: { text: string }) {
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
