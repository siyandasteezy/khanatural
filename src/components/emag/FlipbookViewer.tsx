"use client";

import { useEffect, useRef, useState } from "react";
import type { PageFlip } from "page-flip";

/**
 * Book-style reader for e-Mag PDFs. pdf.js rasterises pages to images and
 * page-flip presents them as a magazine you can drag/click through.
 *
 * Loading is progressive: the book opens as soon as the cover is rendered and
 * the remaining pages stream in behind it, so a large issue is readable within
 * a couple of seconds. Both libraries are browser-only, hence the dynamic
 * imports inside useEffect.
 */
export function FlipbookViewer({ pdfUrl, title }: { pdfUrl: string; title: string }) {
  const bookRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [renderedPages, setRenderedPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjs.getDocument({ url: new URL(pdfUrl, window.location.origin).href }).promise;
        if (cancelled) return;
        setPageCount(pdf.numPages);

        // ~1200px tall balances sharpness against decode time and memory.
        const images: string[] = [];
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

        const { PageFlip } = await import("page-flip");
        // clientWidth can be 0 when the tab is backgrounded or the container is
        // still hidden — fall back so PageFlip never gets zero dimensions
        // (it throws "Invalid width or height"). size:"stretch" re-fits later.
        const containerWidth = bookRef.current.clientWidth || window.innerWidth - 32 || 1024;
        const singlePageWidth = Math.max(240, Math.min(Math.floor(containerWidth / 2), 560));
        const pageHeight = Math.floor(singlePageWidth / pageRatio);

        const flip = new PageFlip(bookRef.current, {
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
      } catch (err) {
        console.error("Failed to load e-Mag PDF", err);
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
      flipRef.current?.destroy();
      flipRef.current = null;
    };
  }, [pdfUrl]);

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

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => flipRef.current?.flipPrev()}
            className="inline-flex h-11 items-center rounded-full border border-sand-200/40 px-5 text-sm font-semibold text-sand-50 hover:bg-sand-50 hover:text-kelp-950"
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <p className="min-w-24 text-center text-sm text-sand-200/80" aria-live="polite">
            Page {page + 1} of {pageCount}
          </p>
          <button
            type="button"
            onClick={() => flipRef.current?.flipNext()}
            className="inline-flex h-11 items-center rounded-full border border-sand-200/40 px-5 text-sm font-semibold text-sand-50 hover:bg-sand-50 hover:text-kelp-950"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-sand-200/60" aria-live="polite">
          {stillPreparing
            ? `Preparing pages… ${renderedPages} of ${pageCount} ready`
            : "Tip: drag a page corner to flip, just like a real magazine."}
        </p>
      </div>
    </div>
  );
}
