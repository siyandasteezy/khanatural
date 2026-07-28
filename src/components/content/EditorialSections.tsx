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
    if ((b.type === "h3" || b.type === "h4") && !current.kicker && current.body.length === 0) {
      current.kicker = (b.text ?? "").trim();
      continue;
    }
    current.body.push(b);
  }
  if (current.heading || current.body.length || current.images.length) sections.push(current);
  return sections;
}

function SectionCopy({ section }: { section: Section }) {
  return (
    <div>
      {section.heading && (
        <h2
          id={section.id}
          className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-kelp-900 sm:text-4xl"
        >
          {section.heading}
        </h2>
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
    </div>
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

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-5 rounded-[3rem] bg-gold-500/10 blur-2xl" />
      <Image
        src={src}
        alt={first.alt || fallbackAlt}
        width={900}
        height={1100}
        priority={priority}
        sizes="(max-width: 1024px) 92vw, 520px"
        className="relative w-full rounded-[2rem] object-cover shadow-2xl shadow-kelp-950/20"
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
export function EditorialSections({ blocks }: { blocks: ContentBlock[] }) {
  const sections = groupSections(blocks);
  let splitIndex = 0;

  return (
    <>
      {sections.map((section, i) => {
        const hasImages = section.images.length > 0;
        const tone = i % 2 === 1 ? "bg-sand-100" : "bg-sand-50";

        if (!hasImages) {
          return (
            <section key={section.id} className={`${tone} py-14 sm:py-20`}>
              <Container>
                <div className="mx-auto max-w-3xl">
                  <SectionCopy section={section} />
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
                  <SectionCopy section={section} />
                </div>
              </div>
            </Container>
          </section>
        );
      })}
    </>
  );
}
