import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DELIVERY_FEE_CENTS } from "@/lib/money";
import { site } from "@/lib/site";
import { createCheckout, isYocoConfigured } from "@/lib/yoco";

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(254),
    phone: z.string().max(30).optional().default(""),
  }),
  address: z.object({
    line1: z.string().min(3).max(200),
    line2: z.string().max(200).optional().default(""),
    city: z.string().min(2).max(100),
    province: z.string().min(2).max(100),
    postalCode: z.string().min(3).max(12),
  }),
  notes: z.string().max(1000).optional().default(""),
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .min(1)
    .max(50),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order details.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const { customer, address, notes, items } = parsed.data;

  // Prices always come from the database — never from the client.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isPublished: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const unavailable = items.filter((i) => !byId.get(i.productId)?.inStock);
  if (unavailable.length > 0 || products.length !== items.length) {
    return NextResponse.json({ error: "Some items in your basket are no longer available." }, { status: 409 });
  }

  const subtotalCents = items.reduce((sum, i) => sum + byId.get(i.productId)!.priceCents * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      customerName: customer.name,
      customerEmail: customer.email.toLowerCase(),
      customerPhone: customer.phone,
      addressLine1: address.line1,
      addressLine2: address.line2,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      notes,
      subtotalCents,
      shippingCents: DELIVERY_FEE_CENTS,
      totalCents: subtotalCents + DELIVERY_FEE_CENTS,
      items: {
        create: items.map((i) => {
          const p = byId.get(i.productId)!;
          return { productId: p.id, name: p.name, unitPriceCents: p.priceCents, quantity: i.quantity };
        }),
      },
    },
    select: { id: true, orderNumber: true, totalCents: true },
  });

  // Without Yoco keys the order still lands (and the admin still sees it) —
  // the customer just gets the manual-payment confirmation instead of a
  // redirect, so a missing key degrades rather than losing the sale.
  if (!isYocoConfigured()) {
    return NextResponse.json(
      { ok: true, orderNumber: order.orderNumber, totalCents: order.totalCents, redirectUrl: null },
      { status: 201 },
    );
  }

  try {
    const checkout = await createCheckout({
      amountCents: order.totalCents,
      successUrl: `${site.url}/checkout/success/?ref=${order.id}`,
      cancelUrl: `${site.url}/checkout/?status=cancelled`,
      failureUrl: `${site.url}/checkout/?status=failed`,
      // the webhook echoes this back — it is how a payment finds its order
      metadata: { orderId: order.id, orderNumber: String(order.orderNumber) },
      externalId: order.id,
      // a retry for the same order reuses the checkout instead of making a second
      idempotencyKey: order.id,
      lineItems: [
        ...items.map((i) => {
          const p = byId.get(i.productId)!;
          return {
            displayName: p.name,
            quantity: i.quantity,
            pricingDetails: { price: p.priceCents },
          };
        }),
        { displayName: "Delivery", quantity: 1, pricingDetails: { price: DELIVERY_FEE_CENTS } },
      ],
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { yocoCheckoutId: checkout.id, paymentStatus: "AWAITING" },
    });

    return NextResponse.json(
      {
        ok: true,
        orderNumber: order.orderNumber,
        totalCents: order.totalCents,
        redirectUrl: checkout.redirectUrl,
      },
      { status: 201 },
    );
  } catch (err) {
    // The order exists; only the handoff to Yoco failed. Say so plainly rather
    // than pretending the order was lost — support can take payment manually.
    console.error("Yoco checkout creation failed", err);
    return NextResponse.json(
      {
        ok: true,
        orderNumber: order.orderNumber,
        totalCents: order.totalCents,
        redirectUrl: null,
        paymentError: "We couldn’t open the card payment page.",
      },
      { status: 201 },
    );
  }
}
