"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

export function MobileMenu({ links }: { links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // close the sheet on navigation (state adjustment during render, not an effect)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // portals need the document — only render the sheet after mount
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The sheet is rendered in a portal on <body>: the header bar uses
  // backdrop-blur, and a backdrop-filter ancestor becomes the containing
  // block for position:fixed — inside the header the sheet would be
  // positioned against the 64px bar (squashed at the bottom of the screen)
  // instead of the viewport.
  const sheet =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[70] lg:hidden">
            <nav
              id="mobile-nav"
              aria-label="Mobile"
              className="flex h-full flex-col overflow-y-auto bg-kelp-950 px-6 pb-10 pt-4"
            >
              <div className="mb-6 flex items-center justify-between">
                {/* black lockup inverted to white for the dark sheet */}
                <Image
                  src="/images/brand/logo.png"
                  alt={site.name}
                  width={666}
                  height={206}
                  className="h-9 w-auto brightness-0 invert"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  autoFocus
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sand-50 hover:bg-kelp-800"
                >
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ul className="space-y-1">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-sand-50 hover:bg-kelp-800"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gold-500 text-sm font-bold uppercase tracking-wider text-kelp-950 hover:bg-gold-400"
                >
                  WhatsApp us
                </a>
                <a href={`mailto:${site.email}`} className="mt-4 block text-center text-sm text-sand-200/70 hover:text-gold-300">
                  {site.email}
                </a>
              </div>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-kelp-800 hover:bg-sand-100"
      >
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      {sheet}
    </div>
  );
}
