import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settleOrder } from "@/lib/payments";
import { verifyWebhookSignature, type YocoWebhookEvent } from "@/lib/yoco";

/**
 * Yoco payment webhook — the only place an order is marked paid.
 *
 * The customer's browser landing on successUrl proves nothing (anyone can open
 * that URL), so payment state is taken from here and nowhere else.
 *
 * Register the endpoint once against your live key:
 *   curl -X POST https://payments.yoco.com/api/webhooks \
 *        -H "Authorization: Bearer $YOCO_SECRET_KEY" \
 *        -H "Content-Type: application/json" \
 *        -d '{"name":"khanatural","url":"https://khanatural.com/api/webhooks/yoco/"}'
 * and put the `secret` it returns in YOCO_WEBHOOK_SECRET.
 */

// signature is over the exact bytes received, so nothing may pre-parse them
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("YOCO_WEBHOOK_SECRET is not set — rejecting webhook");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const check = verifyWebhookSignature({
    id: req.headers.get("webhook-id") ?? "",
    timestamp: req.headers.get("webhook-timestamp") ?? "",
    signatureHeader: req.headers.get("webhook-signature") ?? "",
    rawBody,
    secret,
  });

  if (!check.valid) {
    console.warn("Rejected Yoco webhook:", check.reason);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: YocoWebhookEvent;
  try {
    event = JSON.parse(rawBody) as YocoWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Yoco's payment event carries no checkoutId or externalId, so metadata is
  // the only link back to an order — and it is documented as optional. Log
  // loudly when it is absent rather than returning a silent 200: an order that
  // never settles must not look like a webhook that worked.
  const orderId = event.payload?.metadata?.orderId;
  if (!orderId) {
    console.error(
      `[yoco-webhook] ${event.type} (${event.id}) arrived with no metadata.orderId — ` +
        `payload keys: ${Object.keys(event.payload ?? {}).join(",")}; ` +
        `metadata: ${JSON.stringify(event.payload?.metadata ?? null)}. ` +
        `Order will settle via reconciliation instead.`,
    );
    return NextResponse.json({ received: true, unmatched: true });
  }

  if (event.type === "payment.succeeded" && event.payload.status === "succeeded") {
    const result = await settleOrder({
      orderId,
      paymentId: event.payload.id,
      amountCents: event.payload.amount,
      method: event.payload.paymentMethodDetails?.type,
      cardBrand: event.payload.paymentMethodDetails?.card?.scheme,
      cardLast4: event.payload.paymentMethodDetails?.card?.maskedCard?.slice(-4),
      source: "webhook",
    });
    return NextResponse.json({ received: true, result });
  }

  if (event.type === "payment.failed") {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } });
    // a later failure event must not undo a payment that already succeeded
    if (order && order.paymentStatus !== "PAID") {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED", yocoPaymentId: event.payload.id },
      });
    }
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true, ignored: event.type });
}
