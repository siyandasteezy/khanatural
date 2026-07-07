import { createArticle } from "@/app/admin/actions";
import { AdminTitle } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default function AdminNewArticlePage() {
  return (
    <>
      <AdminTitle title="New article" />
      <ArticleForm action={createArticle} />
    </>
  );
}
