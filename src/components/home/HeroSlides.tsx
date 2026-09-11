"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroSlide = {
  src: string;
  alt: string;
  /**
   * Tailwind object-position utilities. A className rather than an inline
   * style because the hero crops differently per breakpoint — the desktop
   * layout has a gradient across the left of the frame that the mobile one
   * does not, so they want different parts of the photograph.
   */
  position: string;
};

/**
 * Crossfading photographs behind the home page hero.
 *
 * Three things this deliberately does not do:
 *
 *   - It does not slide. The copy sits on top of the photograph on desktop, and
 *     anything that moves horizontally underneath text is hard to read across.
 *     A dissolve leaves the type still.
 *   - It does not render every frame on the server. The first slide is the
 *     page's LCP image; the others would compete with it for bandwidth on the
 *     first paint, which is a poor trade on a South-Africa-first mobile site.
 *     They mount shortly after hydration instead, absolutely positioned at zero
 *     opacity, so nothing on the page moves when they arrive.
 *   - It does not keep cycling in a tab nobody is looking at.
 *
 * Reduced-motion users get the first frame and no rotation at all.
 */
export function HeroSlides({ slides, intervalMs = 7000 }: { slides: HeroSlide[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [mountRest, setMountRest] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setMountRest(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  const rotating = autoplay && !reduceMotion && mountRest && slides.length > 1;

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [rotating, slides.length, intervalMs]);

  const shown = mountRest ? slides : slides.slice(0, 1);

  return (
    <>
      {shown.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          // only the frame on screen describes anything; the others are
          // decorative until they are the one being shown
          alt={i === index ? slide.alt : ""}
          aria-hidden={i !== index}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover ${slide.position} ${
            reduceMotion ? "" : "transition-opacity duration-1000 ease-in-out"
          } ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {mountRest && slides.length > 1 && (
        /* WCAG 2.2.2 — content that starts moving by itself needs a way to stop
           it. Picking a frame is that mechanism: it pins the hero for the rest
           of the visit. Sits bottom-right, clear of the copy on every size. */
        <div className="absolute bottom-5 right-5 z-20 flex gap-2.5 lg:bottom-8 lg:right-8">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => {
                setIndex(i);
                setAutoplay(false);
              }}
              aria-label={`Show image ${i + 1} of ${slides.length}`}
              aria-current={i === index}
              className={`h-2.5 w-2.5 rounded-full ring-1 ring-sand-50/70 transition hover:scale-110 ${
                i === index ? "bg-sand-50" : "bg-sand-50/25 hover:bg-sand-50/60"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
