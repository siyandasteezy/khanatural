import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { RichText } from "./RichText";
import type { ContentBlock } from "./ContentBlocks";

type Section = {
  id: string;
  heading?: string;
  kicker?: string; // an h3/h4 sitting under the heading
  body: ContentBlock[];
  images: ContentBlock[];
  signature?: ContentBlock; // the founder's signature, signed off under the copy
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Split a flat block list into sections at each h2. */
function groupSections(blocks: ContentBlock[]): Section[] {
  const sections: Section[] = [];
  let current: Section = { id: "intro", body: [], images: [] };

  for (const b of blocks) {
    if (b.type === "h2") {
      if (current.heading || current.body.length || current.images.length) sections.push(current);
      const heading = (b.text ?? "").trim();
      current = { id: slugify(heading) || `section-${sections.length}`, heading, body: [], images: [] };
      continue;
    }
    if (b.type === "img") {
      current.images.push(b);
      continue;
    }
    if (b.type === "signature") {
      current.signature = b;
      continue;
    }
    if ((b.type === "h3" || b.type === "h4") && !current.kicker && current.body.length === 0) {
      current.kicker = (b.text ?? "").trim();
      continue;
    }
    current.body.push(b);
  }
  if (current.heading || current.body.length || current.images.length) sections.push(current);
  return sections;
}

function SectionCopy({ section, asH1 = false }: { section: Section; asH1?: boolean }) {
  // Pages that drop the hero copy have no other h1, so their first section
  // heading becomes it — the page keeps exactly one, and the outline stays
  // correct for search engines and screen readers.
  const Heading = asH1 ? "h1" : "h2";
  return (
    <div>
      {section.heading && (
        <Heading
          id={section.id}
          className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-kelp-900 sm:text-4xl"
        >
          {section.heading}
        </Heading>
      )}
      {section.kicker && (
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-gold-600">{section.kicker}</p>
      )}
      <div className="mt-4">
        {section.body.map((b, i) => {
          if (b.type === "h3" || b.type === "h4") {
            return (
              <h3
                key={i}
                className="mt-8 font-[family-name:var(--font-display)] text-xl font-semibold text-kelp-900"
              >
                {b.text}
              </h3>
            );
          }
          if (b.type === "blockquote") {
            return (
              <blockquote key={i} className="my-6 border-l-4 border-gold-500 pl-5 italic text-ink/70">
                {b.text}
              </blockquote>
            );
          }
          return <RichText key={i} text={b.text ?? ""} />;
        })}
      </div>
      {section.signature && <Signature block={section.signature} />}
    </div>
  );
}

/**
 * The founder's signature signs off the section she narrates.
 *
 * The editorial image grid used to stretch the signature across a ~250px
 * square tile, which is what made it look blurry. Rendered small, at its own
 * aspect ratio, it reads as a signature rather than as a broken image.
 */
function Signature({ block }: { block: ContentBlock }) {
  const src = block.localSrc ?? block.src;
  if (!src) return null;
  return (
    <figure className="mt-8 border-t border-sand-300/70 pt-6">
      <Image
        src={src}
        alt={block.alt || "Founder's signature"}
        width={800}
        height={240}
        sizes="180px"
        className="h-auto w-[180px] max-w-full opacity-90"
      />
      <figcaption className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
        Founder, Khanatural
      </figcaption>
    </figure>
  );
}

function SectionImages({
  images,
  priority = false,
  fallbackAlt = "",
}: {
  images: ContentBlock[];
  priority?: boolean;
  /** migrated images often have no alt — describe them by their section */
  fallbackAlt?: string;
}) {
  const [first, ...rest] = images;
  if (!first) return null;
  const src = first.localSrc ?? first.src!;

  // A block that knows its own size is rendered at that aspect, so nothing is
  // cropped. Migrated images carry no dimensions, so they keep the portrait-ish
  // box they were laid out in and fill it.
  const intrinsic = first.width && first.height ? { width: first.width, height: first.height } : null;

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-5 rounded-[3rem] bg-gold-500/10 blur-2xl" />
      <Image
        src={src}
        alt={first.alt || fallbackAlt}
        width={intrinsic?.width ?? 900}
        height={intrinsic?.height ?? 1100}
        priority={priority}
        // the editorial column is half of the 1280 container less the gap
        sizes="(max-width: 1024px) 92vw, 620px"
        className={`relative w-full rounded-[2rem] shadow-2xl shadow-kelp-950/20 ${
          intrinsic ? "h-auto" : "object-cover"
        }`}
      />
      {rest.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {rest.slice(0, 2).map((img, i) => (
            <Image
              key={i}
              src={img.localSrc ?? img.src!}
              alt={img.alt || fallbackAlt}
              width={500}
              height={500}
              sizes="(max-width: 1024px) 45vw, 250px"
              className="aspect-square w-full rounded-2xl object-cover shadow-lg shadow-kelp-950/15"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders migrated page blocks as an alternating editorial layout: sections
 * with imagery become two-column splits (flipping side each time), text-only
 * sections become a centred column. Copy is rendered verbatim.
 */
export function EditorialSections({
  blocks,
  /** promote the first section heading to the page <h1> (for pages with no hero copy) */
  firstHeadingAsH1 = false,
}: {
  blocks: ContentBlock[];
  firstHeadingAsH1?: boolean;
}) {
  const sections = groupSections(blocks);
  let splitIndex = 0;
  const h1SectionId = firstHeadingAsH1 ? sections.find((s) => s.heading)?.id : undefined;

  return (
    <>
      {sections.map((section, i) => {
        const hasImages = section.images.length > 0;
        const hasCopy = Boolean(section.heading) || section.body.length > 0;
        const tone = i % 2 === 1 ? "bg-sand-100" : "bg-sand-50";

        // An image with no words alongside it: both migrated pages open with
        // one. Splitting it two-up leaves half the row empty, which reads as a
        // layout fault — especially now that it is the first thing on the page.
        // Give it the full width instead, so it reads as a deliberate plate.
        if (hasImages && !hasCopy) {
          const img = section.images[0];
          return (
            <section key={section.id} className={`${tone} pb-4 pt-10 sm:pt-14`}>
              <Container>
                <Image
                  src={img.localSrc ?? img.src!}
                  alt={img.alt || ""}
                  width={img.width ?? 1600}
                  height={img.height ?? 900}
                  priority={i === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="aspect-[16/9] w-full rounded-[2rem] object-cover shadow-xl shadow-kelp-950/10"
                />
              </Container>
            </section>
          );
        }

        if (!hasImages) {
          return (
            <section key={section.id} className={`${tone} py-14 sm:py-20`}>
              <Container>
                <div className="mx-auto max-w-3xl">
                  <SectionCopy section={section} asH1={section.id === h1SectionId} />
                </div>
              </Container>
            </section>
          );
        }

        const imageFirst = splitIndex++ % 2 === 0;
        return (
          <section key={section.id} className={`${tone} py-14 sm:py-20`}>
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={imageFirst ? "lg:order-1" : "lg:order-2"}>
                  <SectionImages
                    images={section.images}
                    priority={i === 0}
                    fallbackAlt={section.heading ? `Khanatural — ${section.heading.toLowerCase()}` : ""}
                  />
                </div>
                <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
                  <SectionCopy section={section} asH1={section.id === h1SectionId} />
                </div>
              </div>
            </Container>
          </section>
        );
      })}
    </>
  );
}
