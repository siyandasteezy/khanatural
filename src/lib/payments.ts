import { prisma } from "@/lib/prisma";
import { getCheckout } from "@/lib/yoco";

/**
 * The one place an order is marked paid.
 *
 * Two things can settle an order — the webhook (fast) and a checkout lookup
 * (authoritative fallback) — and they must agree on the rules, so both come
 * through here rather than each writing their own version of "is this paid".
 */

export type SettleResult = "settled" | "already-paid" | "amount-mismatch" | "order-not-found";

export async function settleOrder(input: {
  orderId: string;
  paymentId: string;
  amountCents: number;
  method?: string | null;
  cardBrand?: string | null;
  cardLast4?: string | null;
  source: "webhook" | "reconcile";
}): Promise<SettleResult> {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: { id: true, orderNumber: true, totalCents: true, paymentStatus: true },
  });
  if (!order) return "order-not-found";

  // Webhooks are delivered more than once, and the fallback can race them.
  if (order.paymentStatus === "PAID") return "already-paid";

  // Never settle on an amount we did not ask for — otherwise a tampered
  // checkout could pay R1 against a R370 order and be marked paid.
  if (input.amountCents !== order.totalCents) {
    console.error(
      `[payments] amount mismatch on order ${order.orderNumber} via ${input.source}: ` +
        `paid ${input.amountCents}, expected ${order.totalCents}`,
    );
    return "amount-mismatch";
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      status: "PAID",
      paidAt: new Date(),
      yocoPaymentId: input.paymentId,
      paymentMethod: input.method ?? null,
      paymentCardBrand: input.cardBrand ?? null,
      paymentCardLast4: input.cardLast4 ?? null,
    },
  });
  console.log(`[payments] order ${order.orderNumber} settled via ${input.source} (${input.paymentId})`);
  return "settled";
}

/**
 * Ask Yoco whether an order's checkout completed, and settle it if so.
 *
 * Safe to call repeatedly: it no-ops unless the order is still awaiting payment
 * and Yoco reports the checkout as completed with a payment attached.
 */
export async function reconcileOrderWithYoco(orderId: string): Promise<SettleResult | "still-pending" | "skipped"> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true, yocoCheckoutId: true },
  });
  if (!order || !order.yocoCheckoutId) return "skipped";
  if (order.paymentStatus === "PAID") return "already-paid";

  const checkout = await getCheckout(order.yocoCheckoutId);
  if (checkout.status !== "completed" || !checkout.paymentId) return "still-pending";

  return settleOrder({
    orderId,
    paymentId: checkout.paymentId,
    amountCents: checkout.amount,
    source: "reconcile",
  });
}
