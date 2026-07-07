import type { Metadata } from "next";
import { prisma } from "./prisma";
import { buildMetadata } from "./seo";
import type { ContentBlock } from "@/components/content/ContentBlocks";

export async function getPage(slug: string) {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return null;
  return { ...page, blocks: (page.blocks as ContentBlock[]) ?? [] };
}

/**
 * Metadata for a migrated WordPress page. Stored titles look like
 * "WHY SEAMOSS – Khanatural Shop"; the layout template re-appends the site
 * suffix, so strip it here to avoid doubling while keeping the same output.
 */
export function pageMetadata(
  page: { slug: string; title: string; metaTitle: string | null; metaDescription: string | null },
  fallbackDescription?: string,
): Metadata {
  const raw = page.metaTitle ?? page.title;
  const title = raw.replace(/\s*–\s*Khanatural Shop\s*$/i, "");
  return buildMetadata({
    title,
    description: page.metaDescription ?? fallbackDescription,
    path: page.slug ? `/${page.slug}/` : "/",
  });
}
