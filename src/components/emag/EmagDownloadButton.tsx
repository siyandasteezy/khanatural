"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { hasSubscribed, useSubscribe } from "./useSubscribe";

function startDownload(pdfUrl: string) {
  const a = document.createElement("a");
  a.href = pdfUrl;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Download button for e-Mag issues. First-time downloaders leave their name
 * and email (stored as newsletter subscribers, source "emag-download");
 * returning subscribers — remembered in localStorage — download straight away.
 */
export function EmagDownloadButton({
  pdfUrl,
  issueTitle,
  label = "Download eMag",
  variant = "gold",
  className = "",
}: {
  pdfUrl: string;
  issueTitle: string;
  label?: string;
  variant?: "gold" | "outlineLight";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const { status, subscribe } = useSubscribe("emag-download");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function onClick() {
    if (hasSubscribed()) {
      startDownload(pdfUrl);
      return;
    }
    setDownloaded(false);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ok = await subscribe(String(fd.get("name") ?? ""), String(fd.get("email") ?? ""));
    if (ok) {
      startDownload(pdfUrl);
      setDownloaded(true);
    }
  }

  const buttonClasses =
    variant === "gold"
      ? "bg-gold-500 text-kelp-950 hover:bg-gold-400"
      : "border border-sand-200/50 text-sand-50 hover:bg-sand-50 hover:text-kelp-950";

  const dialog =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="emag-dl-title">
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-kelp-950/70 backdrop-blur-sm" />
            <div ref={dialogRef} className="relative m-0 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:m-4 sm:rounded-3xl sm:p-8">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink/50 hover:bg-sand-100"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>

              {downloaded ? (
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">You’re subscribed</p>
                  <h2 id="emag-dl-title" className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">
                    Enjoy the read!
                  </h2>
                  <p className="mt-3 text-sm text-ink/70">
                    Your download has started. If it didn’t,{" "}
                    <a href={pdfUrl} download className="font-semibold text-kelp-700 underline">
                      download it here
                    </a>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Khanatural e-Mag</p>
                  <h2 id="emag-dl-title" className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">
                    Get {issueTitle}
                  </h2>
                  <p className="mt-2 text-sm text-ink/70">
                    Leave your name and email and we’ll send you each new issue — your download starts right after.
                  </p>
                  <form onSubmit={onSubmit} className="mt-5 space-y-4">
                    <div>
                      <Label htmlFor="emag-dl-name">Name</Label>
                      <Input id="emag-dl-name" name="name" required autoComplete="name" autoFocus />
                    </div>
                    <div>
                      <Label htmlFor="emag-dl-email">Email</Label>
                      <Input id="emag-dl-email" name="email" type="email" required autoComplete="email" />
                    </div>
                    {status === "error" && (
                      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                        Something went wrong — please try again.
                      </p>
                    )}
                    <Button type="submit" variant="gold" size="lg" className="w-full" disabled={status === "loading"}>
                      {status === "loading" ? "One moment…" : "Subscribe & download"}
                    </Button>
                    <p className="text-center text-xs text-ink/50">Free, no spam — unsubscribe any time.</p>
                  </form>
                </>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold uppercase tracking-wide transition-colors ${buttonClasses} ${className}`}
      >
        {label}
      </button>
      {dialog}
    </>
  );
}
