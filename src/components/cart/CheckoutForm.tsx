"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "./CartProvider";
import { formatZar, DELIVERY_FEE_CENTS } from "@/lib/money";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { site } from "@/lib/site";

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

export function CheckoutForm() {
  const { items, subtotalCents, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ orderNumber: number; totalCents: number } | null>(null);

  if (confirmed) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-sand-200">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Order received</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-kelp-900">
          Thank you — order #{confirmed.orderNumber}
        </h2>
        {/* Only reached when the card page could not be opened — the order is
            saved, so the team can arrange payment directly. */}
        <p className="mt-4 text-sm leading-relaxed text-ink/70">
          Your order total is <strong>{formatZar(confirmed.totalCents)}</strong>. We couldn’t open the card payment page
          just now, so we’ve saved your order and will email you payment details shortly. Your order ships once payment
          reflects.
        </p>
        <p className="mt-3 text-sm text-ink/70">
          Questions? Email us at{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-kelp-700 underline">
            {site.email}
          </a>
          .
        </p>
        <div className="mt-8">
          <ButtonLink href="/shop/" variant="gold" size="lg">
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-sand-200">
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-kelp-900">Your basket is empty.</p>
        <div className="mt-6">
          <ButtonLink href="/shop/" variant="gold" size="lg">
            Browse the shop
          </ButtonLink>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone") || "" },
          address: {
            line1: fd.get("line1"),
            line2: fd.get("line2") || "",
            city: fd.get("city"),
            province: fd.get("province"),
            postalCode: fd.get("postalCode"),
          },
          notes: fd.get("notes") || "",
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place your order.");

      // Hand off to Yoco's hosted card page. The basket is deliberately NOT
      // cleared here — the customer might cancel and come back — it clears on
      // the confirmation page instead. Keep `submitting` true so the button
      // stays disabled through the redirect.
      if (data.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return;
      }

      // Yoco unavailable: the order is saved, so confirm it and let the team
      // arrange payment rather than dropping the sale.
      clear();
      setConfirmed({ orderNumber: data.orderNumber, totalCents: data.totalCents });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <fieldset className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200 sm:p-8">
          <legend className="sr-only">Your details</legend>
          <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="co-name">Full name</Label>
              <Input id="co-name" name="name" required autoComplete="name" />
            </div>
            <div>
              <Label htmlFor="co-email">Email</Label>
              <Input id="co-email" name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="co-phone">Phone</Label>
              <Input id="co-phone" name="phone" type="tel" autoComplete="tel" />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200 sm:p-8">
          <legend className="sr-only">Delivery address</legend>
          <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="co-line1">Street address</Label>
              <Input id="co-line1" name="line1" required autoComplete="address-line1" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="co-line2">Apartment / complex (optional)</Label>
              <Input id="co-line2" name="line2" autoComplete="address-line2" />
            </div>
            <div>
              <Label htmlFor="co-city">City / town</Label>
              <Input id="co-city" name="city" required autoComplete="address-level2" />
            </div>
            <div>
              <Label htmlFor="co-province">Province</Label>
              <Select id="co-province" name="province" required defaultValue="">
                <option value="" disabled>
                  Select province
                </option>
                {PROVINCES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="co-postal">Postal code</Label>
              <Input id="co-postal" name="postalCode" required autoComplete="postal-code" inputMode="numeric" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="co-notes">Order notes (optional)</Label>
              <Textarea id="co-notes" name="notes" placeholder="Anything we should know about your delivery?" />
            </div>
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Your order</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3">
              <span className="text-ink/70">
                {i.name} <span className="text-ink/40">× {i.quantity}</span>
              </span>
              <span className="font-semibold">{formatZar(i.priceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-sand-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">Subtotal</dt>
            <dd className="font-semibold">{formatZar(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Delivery (S.A.)</dt>
            <dd className="font-semibold">{formatZar(DELIVERY_FEE_CENTS)}</dd>
          </div>
          <div className="flex justify-between border-t border-sand-200 pt-3 text-base">
            <dt className="font-bold text-kelp-900">Total</dt>
            <dd className="font-bold text-kelp-900">{formatZar(subtotalCents + DELIVERY_FEE_CENTS)}</dd>
          </div>
        </dl>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}
        <Button type="submit" variant="gold" size="lg" className="mt-6 w-full" disabled={submitting}>
          {submitting ? "Placing order…" : "Place order"}
        </Button>
        <p className="mt-3 text-center text-xs text-ink/50">
          EFT payments — we’ve teamed up with Peach Payments. Explore options.
        </p>
      </aside>
    </form>
  );
}
