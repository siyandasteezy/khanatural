"use client";

import Image from "next/image";
import { useState } from "react";

type Img = { url: string; alt: string };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="aspect-square rounded-3xl bg-sand-100" aria-hidden />;
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-white ring-1 ring-sand-200">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-4 flex gap-3" role="tablist" aria-label={`${name} images`}>
          {/* key includes the index — a product can legitimately reuse the same image URL twice */}
          {images.map((img, i) => (
            <li key={`${img.url}-${i}`}>
              <button
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Image ${i + 1} of ${images.length}`}
                onClick={() => setActive(i)}
                className={`relative block h-20 w-20 overflow-hidden rounded-2xl ring-2 transition ${
                  i === active ? "ring-gold-500" : "ring-transparent hover:ring-sand-300"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
