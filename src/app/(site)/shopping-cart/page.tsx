import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { CartContents } from "@/components/cart/CartContents";

export const metadata: Metadata = buildMetadata({
  title: "Shopping Cart",
  description: "Review your Khanatural basket before checkout.",
  path: "/shopping-cart/",
  noIndex: true,
});

export default function ShoppingCartPage() {
  return (
    <>
      <PageHero title="Shopping Cart" />
      <Container className="py-12 sm:py-16">
        <CartContents />
      </Container>
    </>
  );
}
