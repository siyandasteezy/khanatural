import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminTable, AdminTitle, SavedNotice, tdClass } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";

const kindLabels: Record<string, string> = { EMAG_ISSUE: "e-Mag issue", NEWS: "In the news", ARTICLE: "Article" };

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { saved, deleted } = await searchParams;
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <>
      <AdminTitle
        title="Articles & e-Mag"
        action={
          <ButtonLink href="/admin/articles/new/" size="sm">
            New article
          </ButtonLink>
        }
      />
      <SavedNotice show={saved === "1"} text="Article saved." />
      <SavedNotice show={deleted === "1"} text="Article deleted." />
      <AdminTable head={["Title", "Type", "Published", "Date", ""]}>
        {articles.map((a) => (
          <tr key={a.id} className="hover:bg-sand-50">
            <td className={`${tdClass} font-semibold text-kelp-900`}>{a.title}</td>
            <td className={tdClass}>{kindLabels[a.kind] ?? a.kind}</td>
            <td className={tdClass}>{a.isPublished ? "Yes" : <span className="text-ink/40">Draft</span>}</td>
            <td className={`${tdClass} text-ink/50`}>{a.publishedAt.toLocaleDateString("en-ZA")}</td>
            <td className={`${tdClass} text-right`}>
              <Link href={`/admin/articles/${a.id}/`} className="font-semibold text-kelp-700 hover:underline">
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
