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
      {/* The crop is set on the bag rather than the model: this band is only
          ~26% of the frame's height, and on the cart page the KhaNatural bag
          is the subject. */}
      <PageHero title="Shopping Cart" image="/images/shoot/beach-bag-stride.jpg" imagePosition="center 40%" />
      <Container className="py-12 sm:py-16">
        <CartContents />
      </Container>
    </>
  );
}
