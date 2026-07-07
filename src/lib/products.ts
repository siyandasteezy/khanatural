import { prisma } from "./prisma";

export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  priceCents: true,
  regularPriceCents: true,
  onSale: true,
  inStock: true,
  averageRating: true,
  reviewCount: true,
  images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
} as const;

export function getPublishedProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      isPublished: true,
      ...(categorySlug ? { categories: { some: { slug: categorySlug } } } : {}),
    },
    orderBy: [{ inStock: "desc" }, { name: "asc" }],
    select: productCardSelect,
  });
}

export function getShopCategories() {
  return prisma.category.findMany({
    where: { slug: { not: "uncategorised" }, products: { some: { isPublished: true } } },
    orderBy: { sortOrder: "asc" },
  });
}
