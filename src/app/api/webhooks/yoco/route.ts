import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  const orderId = event.payload?.metadata?.orderId;
  if (!orderId) {
    // Not ours, or sent without metadata — acknowledge so Yoco stops retrying.
    console.warn(`Yoco webhook ${event.id} (${event.type}) had no orderId in metadata`);
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true, totalCents: true, paymentStatus: true },
  });
  if (!order) {
    console.warn(`Yoco webhook ${event.id} referenced unknown order ${orderId}`);
    return NextResponse.json({ received: true });
  }

  // Webhooks can arrive more than once; a settled order stays settled.
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "payment.succeeded" && event.payload.status === "succeeded") {
    // Never trust the amount from the redirect chain — confirm Yoco charged
    // what the order actually totals before treating it as settled.
    if (event.payload.amount !== order.totalCents) {
      console.error(
        `Yoco amount mismatch on order ${order.orderNumber}: charged ${event.payload.amount}, expected ${order.totalCents}`,
      );
      return NextResponse.json({ received: true, mismatch: true });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "PAID",
        paidAt: new Date(),
        yocoPaymentId: event.payload.id,
        paymentMethod: event.payload.paymentMethodDetails?.type ?? null,
        paymentCardBrand: event.payload.paymentMethodDetails?.card?.scheme ?? null,
        paymentCardLast4: event.payload.paymentMethodDetails?.card?.maskedCard?.slice(-4) ?? null,
      },
    });
    console.log(`Order ${order.orderNumber} paid via Yoco (${event.payload.id})`);
    return NextResponse.json({ received: true });
  }

  if (event.type === "payment.failed") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED", yocoPaymentId: event.payload.id },
    });
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true, ignored: event.type });
}
