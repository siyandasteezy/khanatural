import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { EmagDownloadButton } from "@/components/emag/EmagDownloadButton";

type EmagIssue = {
  title: string;
  slug: string;
  content: string; // HTML paragraphs migrated from the original homepage
  coverImage: string | null;
  downloadUrl: string | null;
  pageCount: number | null;
};

/**
 * The section sits on an open spread from the issue it is advertising.
 *
 * The ingest already renders every page of every issue, so pages two and three
 * — the first facing pair — are used directly. Nothing is hand-made, so the
 * backdrop follows whichever issue is current without anyone maintaining it.
 *
 * The spread is tilted back and shadowed so it reads as lying on a surface
 * rather than pasted flat, and held at low opacity behind a slight blur: enough
 * to be legibly a magazine, not enough to compete with the copy over it.
 * Measured against the whitest part of a page at the thinnest point of the
 * scrim over the copy: heading 11.9:1, body 8.0:1, eyebrow 7.6:1.
 */
function SpreadBackdrop({ slug }: { slug: string }) {
  const page = (n: number) => `/emag/${slug}/p${String(n).padStart(3, "0")}.webp`;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 flex items-center justify-center [perspective:1400px]">
        <div className="flex w-[132%] max-w-none opacity-[0.42] blur-[2px] [transform:rotateX(14deg)_scale(1.04)] sm:w-[112%] lg:w-[92%]">
          {[2, 3].map((n) => (
            <Image
              key={n}
              src={page(n)}
              alt=""
              width={993}
              height={1404}
              sizes="(max-width: 1024px) 60vw, 46vw"
              className="w-1/2 shadow-2xl shadow-black/60"
            />
          ))}
        </div>
      </div>
      {/* keeps the copy side readable and settles the spread into the dark */}
      <div className="absolute inset-0 bg-gradient-to-r from-kelp-900 via-kelp-900/75 to-kelp-900/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-kelp-900 via-transparent to-kelp-900" />
    </div>
  );
}

export function EmagSection({ issue }: { issue: EmagIssue | null }) {
  if (!issue) return null;
  // an issue uploaded through the admin has a PDF but no rendered pages
  const hasSpread = (issue.pageCount ?? 0) >= 3;
  return (
    <Section
      tone="kelp"
      eyebrow="Khanatural e-Mag"
      title={issue.title.replace(/^Khanatural e-Mag — /, "")}
      align="left"
      id="emag"
      backdrop={hasSpread ? <SpreadBackdrop slug={issue.slug} /> : undefined}
    >
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <div
            className="space-y-4 text-base leading-relaxed text-sand-200/90 [&_p]:m-0"
            dangerouslySetInnerHTML={{ __html: issue.content }}
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href={issue.downloadUrl ? `/media/emag/${issue.slug}/` : "/media/"} variant="gold" size="lg">
              Read the eMag
            </ButtonLink>
            {issue.downloadUrl && (
              <EmagDownloadButton pdfUrl={issue.downloadUrl} issueTitle={issue.title} variant="outlineLight" />
            )}
            <ButtonLink
              href="/media/"
              variant="outline"
              size="lg"
              className="border-sand-200/60 text-sand-50 hover:bg-sand-50 hover:text-kelp-950"
            >
              Past issues
            </ButtonLink>
          </div>
        </div>
        {issue.coverImage && (
          <div className="relative mx-auto w-full max-w-sm lg:max-w-[28rem]">
            <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-gold-500/15 blur-xl" />
            <Image
              src={issue.coverImage}
              alt={`${issue.title} cover`}
              width={480}
              height={680}
              sizes="(max-width: 1024px) 90vw, 448px"
              className="relative w-full rounded-3xl shadow-2xl shadow-kelp-950/50"
            />
          </div>
        )}
      </div>
    </Section>
  );
}
