import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteArticle, updateArticle } from "@/app/admin/actions";
import { AdminTitle } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function AdminEditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  const action = updateArticle.bind(null, article.id);
  const remove = deleteArticle.bind(null, article.id);

  return (
    <>
      <AdminTitle
        title={article.title}
        action={
          <form action={remove}>
            <button type="submit" className="text-sm font-semibold text-red-700 hover:underline">
              Delete article
            </button>
          </form>
        }
      />
      <ArticleForm article={article} action={action} />
    </>
  );
}
