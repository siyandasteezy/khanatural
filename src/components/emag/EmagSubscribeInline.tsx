"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { hasSubscribed, useSubscribe } from "./useSubscribe";

/**
 * Optional subscribe strip under the flipbook reader — reading never requires
 * it. Hidden entirely for readers who already subscribed.
 */
export function EmagSubscribeInline() {
  const { status, subscribe } = useSubscribe("emag-reader");
  const [hidden, setHidden] = useState(true);

  // localStorage is client-only; decide visibility after mount
  useEffect(() => setHidden(hasSubscribed()), []);

  if (hidden && status !== "done") return null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await subscribe(String(fd.get("name") ?? ""), String(fd.get("email") ?? ""));
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-3xl bg-kelp-800/60 p-6 ring-1 ring-sand-50/10 sm:p-8">
      {status === "done" ? (
        <p role="status" className="text-center text-sm font-semibold text-sand-50">
          Thank you — you’ll get every new issue in your inbox.
        </p>
      ) : (
        <>
          <h2 className="text-center font-[family-name:var(--font-display)] text-xl font-semibold text-sand-50">
            Enjoying the read?
          </h2>
          <p className="mt-1 text-center text-sm text-sand-200/80">
            Get every new issue in your inbox — totally optional, keep flipping either way.
          </p>
          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="emag-inline-name" className="sr-only">
              Name
            </label>
            <input
              id="emag-inline-name"
              name="name"
              required
              placeholder="Your name"
              autoComplete="name"
              className="h-12 flex-1 rounded-full border border-sand-200/30 bg-kelp-950/40 px-5 text-sm text-sand-50 placeholder:text-sand-200/50"
            />
            <label htmlFor="emag-inline-email" className="sr-only">
              Email
            </label>
            <input
              id="emag-inline-email"
              name="email"
              type="email"
              required
              placeholder="Your email"
              autoComplete="email"
              className="h-12 flex-1 rounded-full border border-sand-200/30 bg-kelp-950/40 px-5 text-sm text-sand-50 placeholder:text-sand-200/50"
            />
            <Button type="submit" variant="gold" disabled={status === "loading"}>
              {status === "loading" ? "…" : "Subscribe"}
            </Button>
          </form>
          {status === "error" && (
            <p role="alert" className="mt-3 text-center text-sm font-semibold text-red-300">
              Something went wrong — please try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
