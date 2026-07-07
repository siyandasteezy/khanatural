import type { Metadata } from "next";
import { site } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "Account",
  description: "Your Khanatural orders and account.",
  path: "/account/",
  noIndex: true,
});

export default function AccountPage() {
  return (
    <>
      <PageHero title="Account" />
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-sand-200">
          <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-kelp-900">
            Checkout is quick and account-free.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            You don’t need an account to shop with us. For questions about an existing order, chat to us on WhatsApp at{" "}
            <a href={site.whatsappUrl} className="font-semibold text-kelp-700 underline">
              {site.phone}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-kelp-700 underline">
              {site.email}
            </a>
            .
          </p>
          <div className="mt-8">
            <ButtonLink href="/shop/" variant="gold" size="lg">
              Continue shopping
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
