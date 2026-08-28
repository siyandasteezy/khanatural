import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  description: "Secure Khanatural checkout — card and Instant EFT payments, R120 delivery in S.A.",
  path: "/checkout/",
  noIndex: true,
});

/** Yoco sends the customer back here with ?status= when they don't complete. */
const RETURN_NOTICES: Record<string, string> = {
  cancelled: "You cancelled the payment, so nothing was charged. Your basket is exactly as you left it.",
  failed: "That payment didn’t go through and you have not been charged. You can try again below.",
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const notice = status ? RETURN_NOTICES[status] : undefined;

  return (
    <>
      <PageHero title="Checkout" lead="R120 for delivery in S.A. Card and Instant EFT payments, secured by Yoco." />
      <Container className="py-12 sm:py-16">
        {notice && (
          <div
            role="status"
            className="mx-auto mb-8 max-w-3xl rounded-2xl border border-gold-500/40 bg-gold-500/10 p-5 text-sm text-kelp-900"
          >
            {notice}
          </div>
        )}
        <CheckoutForm />
      </Container>
    </>
  );
}
