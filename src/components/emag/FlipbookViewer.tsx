"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PageFlip } from "page-flip";
import type { PDFDocumentProxy } from "pdfjs-dist";

/**
 * Book-style reader for e-Mag issues, presented by page-flip as a magazine you
 * can drag/click through.
 *
 * Pages come from one of two places:
 *
 *   `pages` — URLs of images rendered ahead of time by scripts/ingest-magazine.py.
 *   The book opens after a couple of hundred KB, and the browser never sees the
 *   PDF. This is the path every ingested issue takes.
 *
 *   otherwise — pdf.js downloads the PDF and rasterises it here, progressively:
 *   the book opens once the cover is ready and the rest stream in behind it.
 *   Kept for issues uploaded through the admin, which have no pre-rendered
 *   pages. It means downloading the whole file first, so it only stays tolerable
 *   while those issues are small.
 *
 * Either way the zoom lightbox wants more resolution than the book does, so it
 * pulls the PDF in on first zoom and re-renders that page large.
 */
export function FlipbookViewer({
  pdfUrl,
  title,
  pages,
}: {
  pdfUrl: string;
  title: string;
  /** Pre-rendered page image URLs, in reading order. */
  pages?: string[];
}) {
  const bookRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const imagesRef = useRef<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [renderedPages, setRenderedPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  // The parent builds `pages` inline, so its identity changes every render.
  // Keying the effect on the joined list keeps it from re-opening the book.
  const pagesKey = pages?.join("|") ?? "";

  useEffect(() => {
    let cancelled = false;
    const pageUrls = pagesKey ? pagesKey.split("|") : [];

    /** Build the book. Returns the instance so callers can keep feeding it. */
    async function openBook(images: string[], pageRatio: number) {
      const { PageFlip } = await import("page-flip");
      const containerWidth = bookRef.current!.clientWidth;
      const singlePageWidth = Math.min(Math.floor(containerWidth / 2), 560);
      const pageHeight = Math.floor(singlePageWidth / pageRatio);

      const flip = new PageFlip(bookRef.current!, {
        width: singlePageWidth,
        height: pageHeight,
        size: "stretch",
        minWidth: 240,
        maxWidth: 1200,
        minHeight: 320,
        maxHeight: 1600,
        showCover: true,
        usePortrait: true, // single page on narrow screens
        maxShadowOpacity: 0.35,
        mobileScrollSupport: true,
        flippingTime: 700,
      });
      flip.loadFromImages([...images]);
      flip.on("flip", (e) => setPage(e.data as number));
      flipRef.current = flip;
      setStatus("ready");
      return flip;
    }

    /** Pre-rendered path: hand page-flip the URLs and let it fetch them. */
    async function loadFromPrerendered(urls: string[]) {
      // every page in an ingested issue shares the source page size, so the
      // cover's dimensions size the whole book
      const ratio = await new Promise<number>((resolve) => {
        const probe = new window.Image();
        probe.onload = () => resolve(probe.naturalWidth / probe.naturalHeight);
        probe.onerror = () => resolve(210 / 297); // A4 portrait fallback
        probe.src = urls[0];
      });
      if (cancelled || !bookRef.current) return;

      imagesRef.current = [...urls];
      setPageCount(urls.length);
      setRenderedPages(urls.length);
      await openBook(urls, ratio);
    }

    async function loadFromPdf() {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const pdf = await pdfjs.getDocument({ url: new URL(pdfUrl, window.location.origin).href }).promise;
      if (cancelled) return;
      pdfRef.current = pdf;
      setPageCount(pdf.numPages);

      // ~1200px tall balances sharpness against decode time and memory.
      const images = imagesRef.current;
      images.length = 0;
      let pageRatio = 210 / 297; // A4 portrait fallback

      const renderPage = async (i: number) => {
        const pdfPage = await pdf.getPage(i);
        const base = pdfPage.getViewport({ scale: 1 });
        if (i === 1) pageRatio = base.width / base.height;
        const viewport = pdfPage.getViewport({ scale: 1200 / base.height });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        // intent "print" renders without requestAnimationFrame scheduling,
        // so pages keep rasterising even when the tab is in the background.
        await pdfPage.render({ canvas, viewport, intent: "print" }).promise;
        images.push(canvas.toDataURL("image/jpeg", 0.85));
        setRenderedPages(i);
      };

      // Render the cover, then open the book immediately.
      await renderPage(1);
      if (!bookRef.current || cancelled) return;

      const flip = await openBook(images, pageRatio);

      // Stream the remaining pages in, refreshing the book in small batches
      // so flipping stays smooth while pages arrive.
      const BATCH = 3;
      for (let i = 2; i <= pdf.numPages; i++) {
        if (cancelled) return;
        await renderPage(i);
        if (images.length % BATCH === 0 || i === pdf.numPages) {
          flip.updateFromImages([...images]);
        }
      }
    }

    (async () => {
      try {
        if (pageUrls.length > 0) await loadFromPrerendered(pageUrls);
        else await loadFromPdf();
      } catch (err) {
        console.error("Failed to open e-Mag", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      flipRef.current?.destroy();
      flipRef.current = null;
      pdfRef.current = null;
    };
  }, [pdfUrl, pagesKey]);

  const closeZoom = useCallback((viewedIndex: number) => {
    setZoomIndex(null);
    // bring the book to the page the reader ended up on in the lightbox
    try {
      flipRef.current?.turnToPage(viewedIndex);
      setPage(viewedIndex);
    } catch {
      /* book may not have that page yet */
    }
  }, []);

  if (status === "error") {
    return (
      <div className="rounded-3xl bg-kelp-800/60 p-10 text-center text-sand-50 ring-1 ring-sand-50/10">
        <p className="font-semibold">We couldn’t open the magazine in your browser.</p>
        <a href={pdfUrl} download className="mt-4 inline-block rounded-full bg-gold-500 px-6 py-2.5 text-sm font-bold text-kelp-950">
          Download the PDF instead
        </a>
      </div>
    );
  }

  const stillPreparing = status === "ready" && pageCount > 0 && renderedPages < pageCount;
  const controlClass =
    "inline-flex h-11 items-center gap-2 rounded-full border border-sand-200/40 px-5 text-sm font-semibold text-sand-50 hover:bg-sand-50 hover:text-kelp-950 disabled:opacity-40 disabled:pointer-events-none";

  return (
    <div>
      {status === "loading" && (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto flex aspect-[4/3] w-full max-w-3xl flex-col items-center justify-center rounded-3xl bg-kelp-800/60 text-sand-50 ring-1 ring-sand-50/10"
        >
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold">Opening {title}…</p>
          <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-kelp-950/60">
            <div
              className="h-full animate-pulse rounded-full bg-gold-500 transition-all"
              style={{ width: pageCount ? `${Math.max(8, Math.round((renderedPages / pageCount) * 100))}%` : "8%" }}
            />
          </div>
        </div>
      )}

      {/* page-flip mounts here. While loading, keep the container invisible but
          at full layout width — PageFlip reads clientWidth at init and refuses
          to start inside a display:none (zero-width) element. */}
      <div className={status === "ready" ? "select-none [&_canvas]:rounded" : "invisible h-0 overflow-hidden"}>
        <div ref={bookRef} className="mx-auto max-w-5xl [&_.stf__parent]:mx-auto" />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button type="button" onClick={() => flipRef.current?.flipPrev()} className={controlClass} aria-label="Previous page">
            ← Previous
          </button>
          <p className="min-w-24 text-center text-sm text-sand-200/80" aria-live="polite">
            Page {page + 1} of {pageCount}
          </p>
          <button type="button" onClick={() => flipRef.current?.flipNext()} className={controlClass} aria-label="Next page">
            Next →
          </button>
          <button
            type="button"
            onClick={() => setZoomIndex(Math.min(page, Math.max(0, imagesRef.current.length - 1)))}
            className={controlClass}
            aria-label="Zoom into this page"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0ZM10.5 7.5v6M7.5 10.5h6"
              />
            </svg>
            Zoom
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-sand-200/60" aria-live="polite">
          {stillPreparing
            ? `Preparing pages… ${renderedPages} of ${pageCount} ready`
            : "Tip: drag a page corner to flip, just like a real magazine."}
        </p>
      </div>

      {zoomIndex !== null && (
        <ZoomLightbox
          title={title}
          startIndex={zoomIndex}
          pageCount={pageCount}
          renderedPages={renderedPages}
          imagesRef={imagesRef}
          pdfRef={pdfRef}
          onClose={closeZoom}
        />
      )}
    </div>
  );
}

/**
 * Full-screen page viewer. Fit-to-screen by default; clicking zooms ~2.2× into
 * the clicked spot (scroll/drag to pan, click again to fit). Pages are lazily
 * re-rendered from the PDF at high resolution the first time they're zoomed.
 */
function ZoomLightbox({
  title,
  startIndex,
  pageCount,
  renderedPages,
  imagesRef,
  pdfRef,
  onClose,
}: {
  title: string;
  startIndex: number;
  pageCount: number;
  renderedPages: number;
  imagesRef: React.RefObject<string[]>;
  pdfRef: React.RefObject<PDFDocumentProxy | null>;
  onClose: (viewedIndex: number) => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [hiRes, setHiRes] = useState<string | null>(null);
  const hiResCache = useRef(new Map<number, string>());
  const scrollRef = useRef<HTMLDivElement>(null);
  const clickPoint = useRef({ x: 0.5, y: 0.5 });
  const maxIndex = Math.min(renderedPages, pageCount) - 1;

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(next, maxIndex)));
      setZoomed(false);
      setHiRes(null);
    },
    [maxIndex],
  );

  // lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(index);
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo, onClose]);

  // lazily re-render the page at high resolution for crisp zooming
  useEffect(() => {
    let stale = false;
    const cached = hiResCache.current.get(index);
    if (cached) {
      setHiRes(cached);
      return;
    }
    const pdf = pdfRef.current;
    if (!pdf) return;
    (async () => {
      try {
        const pdfPage = await pdf.getPage(index + 1);
        const base = pdfPage.getViewport({ scale: 1 });
        const viewport = pdfPage.getViewport({ scale: 2600 / base.height });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await pdfPage.render({ canvas, viewport, intent: "print" }).promise;
        const url = canvas.toDataURL("image/jpeg", 0.85);
        hiResCache.current.set(index, url);
        if (!stale) setHiRes(url);
      } catch {
        /* zoom falls back to the book-resolution image */
      }
    })();
    return () => {
      stale = true;
    };
  }, [index, pdfRef]);

  // after toggling zoom, keep the clicked spot centred in the viewport
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !zoomed) return;
    const { x, y } = clickPoint.current;
    el.scrollTo({
      left: el.scrollWidth * x - el.clientWidth / 2,
      top: el.scrollHeight * y - el.clientHeight / 2,
    });
  }, [zoomed]);

  function onImageClick(e: React.MouseEvent<HTMLImageElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    clickPoint.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    setZoomed((z) => !z);
  }

  const src = hiRes ?? imagesRef.current?.[index];
  if (!src) return null;

  const navButton =
    "pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-kelp-950/70 text-xl text-sand-50 backdrop-blur hover:bg-gold-500 hover:text-kelp-950 disabled:opacity-30 disabled:pointer-events-none";

  return createPortal(
    <div className="fixed inset-0 z-[90] bg-kelp-950/97" role="dialog" aria-modal="true" aria-label={`${title} — zoomed page view`}>
      {/* scrollable page area; scrolling pans when zoomed */}
      <div ref={scrollRef} className="absolute inset-0 overflow-auto overscroll-contain">
        <div className="flex min-h-full min-w-full items-center justify-center p-4 pt-20 sm:p-8 sm:pt-20">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL from pdf.js, next/image adds nothing */}
          <img
            src={src}
            alt={`${title}, page ${index + 1}`}
            onClick={onImageClick}
            className={`rounded-lg shadow-2xl shadow-black/50 transition-[max-height,max-width] ${
              zoomed ? "max-h-none max-w-none cursor-zoom-out" : "max-h-[calc(100vh-9rem)] max-w-[92vw] cursor-zoom-in"
            }`}
            style={zoomed ? { height: "220vh" } : undefined}
            draggable={false}
          />
        </div>
      </div>

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-kelp-950 to-transparent px-4 py-3 sm:px-6">
        <p className="truncate text-sm font-semibold text-sand-200/90">{title}</p>
        <div className="pointer-events-auto flex items-center gap-2">
          <p className="mr-1 text-sm text-sand-200/70" aria-live="polite">
            Page {index + 1} of {pageCount}
          </p>
          <button
            type="button"
            onClick={() => onClose(index)}
            autoFocus
            aria-label="Close zoom view"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-kelp-950/70 text-sand-50 backdrop-blur hover:bg-gold-500 hover:text-kelp-950"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* side navigation */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-4">
        <button type="button" onClick={() => goTo(index - 1)} disabled={index <= 0} className={navButton} aria-label="Previous page">
          ‹
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-4">
        <button type="button" onClick={() => goTo(index + 1)} disabled={index >= maxIndex} className={navButton} aria-label="Next page">
          ›
        </button>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-sand-200/50">
        {zoomed ? "Scroll to pan — click the page to fit the screen" : "Click anywhere on the page to zoom in"}
      </p>
    </div>,
    document.body,
  );
}
