import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reconcileOrderWithYoco } from "@/lib/payments";
import { isYocoConfigured } from "@/lib/yoco";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { formatZar } from "@/lib/money";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { PaymentPending } from "@/components/cart/PaymentPending";

export const metadata: Metadata = buildMetadata({
  title: "Order confirmed",
  description: "Your Khanatural order has been received.",
  path: "/checkout/success/",
  noIndex: true,
});

// payment state changes by webhook; never serve this from cache
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  // Settle before rendering where we can. The customer arrives here straight
  // from Yoco, so asking Yoco whether the checkout completed usually beats
  // waiting for a webhook — and covers the case where the webhook never
  // matches the order at all, since its payload carries no checkout id.
  if (isYocoConfigured()) {
    try {
      await reconcileOrderWithYoco(ref);
    } catch (err) {
      console.error("[checkout-success] reconciliation failed", err);
    }
  }

  // `ref` is the order's cuid — unguessable, so it acts as the capability to
  // view this one order without exposing sequential order numbers.
  const order = await prisma.order.findUnique({
    where: { id: ref },
    select: {
      orderNumber: true,
      totalCents: true,
      customerEmail: true,
      paymentStatus: true,
      paymentCardBrand: true,
      paymentCardLast4: true,
      items: { select: { id: true, name: true, quantity: true, unitPriceCents: true } },
    },
  });
  if (!order) notFound();

  const paid = order.paymentStatus === "PAID";
  const failed = order.paymentStatus === "FAILED";

  return (
    <>
      {/* the basket has served its purpose once Yoco has the order */}
      <ClearCartOnMount />
      <PageHero
        title={failed ? "Payment not completed" : "Thank you"}
        lead={
          failed
            ? "We couldn’t confirm a payment for this order."
            : `Order #${order.orderNumber} has been received.`
        }
      />
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-sand-200 sm:p-10">
          {failed ? (
            <p className="text-sm leading-relaxed text-ink/70">
              Your card was not charged. You can try again from the checkout, or email us at{" "}
              <a href={`mailto:${site.email}`} className="font-semibold text-kelp-700 underline">
                {site.email}
              </a>{" "}
              and we’ll help you complete it.
            </p>
          ) : paid ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Payment received</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">
                We’re packing your order
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink/70">
                We’ve sent a confirmation to <strong>{order.customerEmail}</strong>
                {order.paymentCardLast4 && (
                  <>
                    {" "}
                    for the payment made with your {order.paymentCardBrand ?? "card"} ending {order.paymentCardLast4}
                  </>
                )}
                . Delivery is R120 nationwide and your order ships once it’s packed.
              </p>
            </>
          ) : (
            // Yoco's redirect regularly beats its webhook; poll rather than
            // claim a payment we have not actually been told about
            <PaymentPending orderRef={ref} />
          )}

          <ul className="mt-8 space-y-2 border-t border-sand-200 pt-6 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-ink/70">
                  {i.name} <span className="text-ink/40">× {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatZar(i.unitPriceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-sand-200 pt-4 text-base font-semibold text-kelp-900">
            <span>Total</span>
            <span>{formatZar(order.totalCents)}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shop/" variant="gold" size="lg">
              Continue shopping
            </ButtonLink>
            {failed && (
              <ButtonLink href="/checkout/" variant="outline" size="lg">
                Try again
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
