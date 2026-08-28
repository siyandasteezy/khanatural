"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/**
 * Shown when the customer lands back from Yoco before its webhook has arrived.
 *
 * The redirect and the webhook race, and the redirect usually wins by a second
 * or two. Rather than assert a payment we haven't been told about, poll the
 * order until it settles — and if it never does, say so honestly instead of
 * spinning forever.
 */
export function PaymentPending({ orderRef }: { orderRef: string }) {
  const [state, setState] = useState<"waiting" | "paid" | "failed" | "timeout">("waiting");

  useEffect(() => {
    if (state !== "waiting") return;
    let cancelled = false;
    const startedAt = Date.now();
    // each poll may ask Yoco to confirm the checkout, so keep the cadence
    // gentle rather than hammering their API for a single order
    const LIMIT_MS = 45_000;
    const INTERVAL_MS = 3_000;

    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/orders/${orderRef}/status/`, { cache: "no-store" });
        if (res.ok) {
          const { paymentStatus } = (await res.json()) as { paymentStatus: string };
          if (cancelled) return;
          if (paymentStatus === "PAID") {
            setState("paid");
            // re-render the server page so it shows the settled state
            window.location.reload();
            return;
          }
          if (paymentStatus === "FAILED") {
            setState("failed");
            window.location.reload();
            return;
          }
        }
      } catch {
        /* transient — try again on the next tick */
      }
      if (Date.now() - startedAt > LIMIT_MS) {
        if (!cancelled) setState("timeout");
        return;
      }
      timer = window.setTimeout(tick, INTERVAL_MS);
    };

    let timer = window.setTimeout(tick, 1500); // first check quickly, then settle into INTERVAL_MS
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [orderRef, state]);

  if (state === "timeout") {
    return (
      <>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Order received</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">
          We’re still confirming your payment
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/70">
          Your order is safely with us. Payment confirmation from the bank is taking longer than usual — we’ll email{" "}
          you as soon as it lands. Nothing further is needed from you. If you’d like to check, email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-kelp-700 underline">
            {site.email}
          </a>
          .
        </p>
      </>
    );
  }

  return (
    <div role="status" aria-live="polite">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Order received</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">
        Confirming your payment…
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-ink/70">
        This usually takes a few seconds. You can safely leave this page — your order is already with us and we’ll email
        you a confirmation.
      </p>
      <div className="mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-sand-200">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-gold-500" />
      </div>
    </div>
  );
}
