import Image from "next/image";
import { Section } from "@/components/ui/Section";

export type TestimonialData = {
  id: string;
  author: string;
  location: string;
  quote: string;
  imageUrl: string | null;
};

export function Testimonials({ testimonials }: { testimonials: TestimonialData[] }) {
  if (testimonials.length === 0) return null;
  return (
    <Section id="testimonials" eyebrow="Real results" title="What Our Clients Say">
      <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>li]:mb-6 [&>li]:break-inside-avoid">
        {testimonials.map((t) => (
          <li key={t.id}>
            <figure className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200 sm:p-8">
              <blockquote className="text-sm leading-relaxed text-ink/75">
                {t.quote.split("\n\n").map((para, i) => (
                  <p key={i} className={i > 0 ? "mt-3" : ""}>
                    {i === 0 ? "“" : ""}
                    {para.replace(/[”“]+$/g, "").replace(/^[”“]+/g, "")}
                    {i === t.quote.split("\n\n").length - 1 ? "”" : ""}
                  </p>
                ))}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-sand-200 pt-5">
                {t.imageUrl && (
                  <Image
                    src={t.imageUrl}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-bold text-kelp-900">{t.author}</p>
                  <p className="text-xs text-ink/50">{t.location}</p>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
