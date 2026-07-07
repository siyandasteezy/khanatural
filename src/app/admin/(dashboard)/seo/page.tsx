import { prisma } from "@/lib/prisma";
import { updatePageSeo } from "@/app/admin/actions";
import { AdminCard, AdminTitle, SavedNotice } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export default async function AdminSeoPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });

  return (
    <>
      <AdminTitle title="Page SEO" />
      <SavedNotice show={saved === "1"} text="SEO settings saved." />
      <p className="mb-6 max-w-2xl text-sm text-ink/70">
        Titles and meta descriptions for the migrated pages. Product and article SEO is edited on each product/article. The XML
        sitemap, canonical URLs, Open Graph tags and structured data are generated automatically.
      </p>
      <div className="space-y-6">
        {pages.map((page) => {
          const action = updatePageSeo.bind(null, page.id);
          const path = page.slug ? `/${page.slug}/` : "/";
          return (
            <AdminCard key={page.id}>
              <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">{path}</h2>
              <form action={action} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                <div>
                  <Label htmlFor={`seo-title-${page.id}`}>Meta title</Label>
                  <Input id={`seo-title-${page.id}`} name="metaTitle" defaultValue={page.metaTitle ?? ""} />
                </div>
                <div>
                  <Label htmlFor={`seo-desc-${page.id}`}>Meta description</Label>
                  <Textarea id={`seo-desc-${page.id}`} name="metaDescription" defaultValue={page.metaDescription ?? ""} rows={2} />
                </div>
                <div className="self-end">
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </div>
              </form>
            </AdminCard>
          );
        })}
      </div>
    </>
  );
}
