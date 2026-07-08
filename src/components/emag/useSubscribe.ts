"use client";

import { useState } from "react";

/**
 * Shared subscribe call for the e-Mag forms. Remembers success in
 * localStorage so a reader who already left their details isn't asked again
 * on the next download.
 */
export const SUBSCRIBED_KEY = "khanatural.subscribed.v1";

export function hasSubscribed(): boolean {
  try {
    return localStorage.getItem(SUBSCRIBED_KEY) === "1";
  } catch {
    return false;
  }
}

export function useSubscribe(source: "newsletter" | "emag-download" | "emag-reader") {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function subscribe(name: string, email: string): Promise<boolean> {
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source }),
      });
      if (!res.ok) throw new Error();
      try {
        localStorage.setItem(SUBSCRIBED_KEY, "1");
      } catch {
        /* private browsing — fine */
      }
      setStatus("done");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }

  return { status, subscribe };
}
