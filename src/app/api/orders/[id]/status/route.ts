import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Payment status for one order, polled by the success page while Yoco's
 * webhook catches up with the browser redirect.
 *
 * The id is the order's cuid, which the customer only has because they just
 * completed that checkout. It returns payment state and nothing else — no
 * customer details, address or totals — so a guessed id leaks nothing useful.
 */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { paymentStatus: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(
    { paymentStatus: order.paymentStatus },
    { headers: { "Cache-Control": "no-store" } },
  );
}
