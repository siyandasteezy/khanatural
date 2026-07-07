import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = buildMetadata({
  title: "Checkout",
  description: "Secure Khanatural checkout — EFT payments with Peach Payments, R120 delivery in S.A.",
  path: "/checkout/",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <>
      <PageHero title="Checkout" lead="R120 for delivery in S.A. EFT payments powered by Peach Payments." />
      <Container className="py-12 sm:py-16">
        <CheckoutForm />
      </Container>
    </>
  );
}
