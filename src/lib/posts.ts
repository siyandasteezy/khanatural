import { ArticleKind } from "@prisma/client";

/**
 * Article kinds that appear in the "In the news" blog on /media/.
 *
 * EMAG_ISSUE is deliberately excluded — issues have their own flip-through
 * reader and grid. Both NEWS and ARTICLE are treated as blog posts, so
 * whichever the admin picks in the Type dropdown ends up on the page rather
 * than silently going nowhere.
 */
// typed wide so `POST_KINDS.includes(article.kind)` accepts any ArticleKind
export const POST_KINDS: ArticleKind[] = [ArticleKind.NEWS, ArticleKind.ARTICLE];

export function formatPostDate(date: Date): string {
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}
