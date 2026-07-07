"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p role="status" className="rounded-2xl bg-kelp-100 px-6 py-4 text-sm font-semibold text-kelp-800">
        Thank you — you’re subscribed. Keep an eye on your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email
      </label>
      <Input
        id="newsletter-email"
        type="email"
        name="email"
        required
        placeholder="Your email address"
        autoComplete="email"
        className="flex-1"
      />
      <Button type="submit" variant="gold" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Submit"}
      </Button>
      {status === "error" && (
        <p role="alert" className="text-sm font-semibold text-red-700 sm:self-center">
          Something went wrong — please try again.
        </p>
      )}
    </form>
  );
}
