"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatZar, DELIVERY_FEE_CENTS } from "@/lib/money";
import { ButtonLink } from "@/components/ui/Button";

export function CartContents() {
  const { items, subtotalCents, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-sand-200">
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-kelp-900">Your basket is empty.</p>
        <p className="mt-2 text-sm text-ink/60">Nurture your body, mind and soul; khaNaturally.</p>
        <div className="mt-6">
          <ButtonLink href="/shop/" variant="gold" size="lg">
            Browse the shop
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sand-200 sm:p-5">
            {item.image && (
              <Link href={`/product/${item.slug}/`} className="shrink-0">
                <Image src={item.image} alt="" width={96} height={96} className="h-24 w-24 rounded-2xl object-cover" />
              </Link>
            )}
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/product/${item.slug}/`} className="font-semibold text-kelp-900 hover:text-kelp-700">
                  {item.name}
                </Link>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="text-sm text-ink/40 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <p className="mt-1 text-sm text-ink/60">{formatZar(item.priceCents)}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex h-9 items-center rounded-full border border-sand-300">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="h-9 w-9 rounded-l-full font-semibold hover:bg-sand-100"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="h-9 w-9 rounded-r-full font-semibold hover:bg-sand-100"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>
                <p className="font-semibold text-kelp-900">{formatZar(item.priceCents * item.quantity)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
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
        <ButtonLink href="/checkout/" variant="gold" size="lg" className="mt-6 w-full">
          Proceed to checkout
        </ButtonLink>
        <p className="mt-3 text-center text-xs text-ink/50">Card &amp; Instant EFT payments, secured by Yoco.</p>
      </aside>
    </div>
  );
}
