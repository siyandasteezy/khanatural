import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reconcileOrderWithYoco } from "@/lib/payments";
import { isYocoConfigured } from "@/lib/yoco";

/**
 * Payment status for one order, polled by the success page.
 *
 * It does more than read the database. Yoco's payment webhook carries no
 * checkoutId — only optional `metadata` links it to an order — so an order can
 * be genuinely paid while the webhook never matched it. When the order is still
 * awaiting payment, this asks Yoco directly whether its checkout completed and
 * settles it from that. The webhook stays the fast path; this is what makes
 * settlement actually reliable.
 *
 * The id is the order's cuid, which the customer only has because they just
 * completed that checkout. Only payment state is returned — no customer
 * details, address or totals — so a guessed id leaks nothing.
 */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { paymentStatus: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.paymentStatus === "AWAITING" && isYocoConfigured()) {
    try {
      const result = await reconcileOrderWithYoco(id);
      if (result === "settled" || result === "already-paid") {
        return NextResponse.json({ paymentStatus: "PAID" }, { headers: { "Cache-Control": "no-store" } });
      }
    } catch (err) {
      // A lookup failure must not break the page — fall through to the stored
      // status and let the next poll try again.
      console.error("[order-status] Yoco reconciliation failed", err);
    }
  }

  return NextResponse.json({ paymentStatus: order.paymentStatus }, { headers: { "Cache-Control": "no-store" } });
}
