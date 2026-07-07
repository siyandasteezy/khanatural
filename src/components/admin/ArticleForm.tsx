import type { Article } from "@prisma/client";
import { AdminCard } from "./ui";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";

export function ArticleForm({ article, action }: { article?: Article; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <AdminCard>
          <div className="space-y-4">
            <div>
              <Label htmlFor="a-title">Title</Label>
              <Input id="a-title" name="title" defaultValue={article?.title ?? ""} required />
            </div>
            <div>
              <Label htmlFor="a-slug">Slug (URL)</Label>
              <Input id="a-slug" name="slug" defaultValue={article?.slug ?? ""} placeholder="auto-generated from title" />
            </div>
            <div>
              <Label htmlFor="a-excerpt">Excerpt</Label>
              <Textarea id="a-excerpt" name="excerpt" defaultValue={article?.excerpt ?? ""} rows={3} />
            </div>
            <div>
              <Label htmlFor="a-content">Content (HTML)</Label>
              <Textarea id="a-content" name="content" defaultValue={article?.content ?? ""} rows={14} />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">SEO</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="a-seo-title">SEO title</Label>
              <Input id="a-seo-title" name="seoTitle" defaultValue={article?.seoTitle ?? ""} />
            </div>
            <div>
              <Label htmlFor="a-seo-desc">Meta description</Label>
              <Textarea id="a-seo-desc" name="seoDescription" defaultValue={article?.seoDescription ?? ""} rows={3} />
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="space-y-6">
        <AdminCard>
          <div className="space-y-4">
            <div>
              <Label htmlFor="a-kind">Type</Label>
              <Select id="a-kind" name="kind" defaultValue={article?.kind ?? "ARTICLE"}>
                <option value="EMAG_ISSUE">e-Mag issue</option>
                <option value="NEWS">In the news</option>
                <option value="ARTICLE">Article</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="a-published-at">Publish date</Label>
              <Input
                id="a-published-at"
                name="publishedAt"
                type="date"
                defaultValue={(article?.publishedAt ?? new Date()).toISOString().slice(0, 10)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-kelp-900">
              <input type="checkbox" name="isPublished" defaultChecked={article?.isPublished ?? true} className="h-4 w-4 accent-kelp-700" />
              Published
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="space-y-4">
            <div>
              <Label htmlFor="a-cover">Cover image URL</Label>
              <Input id="a-cover" name="coverImage" defaultValue={article?.coverImage ?? ""} placeholder="/images/…" />
            </div>
            <div>
              <Label htmlFor="a-pdf">e-Mag PDF</Label>
              <input
                id="a-pdf"
                name="pdf"
                type="file"
                accept="application/pdf"
                className="block w-full cursor-pointer rounded-xl border border-sand-300 bg-white text-sm text-ink/70 file:mr-3 file:cursor-pointer file:rounded-l-xl file:border-0 file:bg-kelp-800 file:px-4 file:py-3 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-sand-50 hover:file:bg-kelp-700"
              />
              <p className="mt-1.5 text-xs text-ink/50">
                {article?.downloadUrl ? (
                  <>
                    Current file:{" "}
                    <a href={article.downloadUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-kelp-700 underline">
                      {article.downloadUrl.split("/").pop()}
                    </a>{" "}
                    — uploading a new PDF replaces it. Readers flip through it at /media/emag/{article.slug}/.
                  </>
                ) : (
                  "Upload the issue as a PDF (max 50MB). It becomes a flip-through magazine on the site."
                )}
              </p>
            </div>
            <div>
              <Label htmlFor="a-download">Download URL (set automatically on upload)</Label>
              <Input id="a-download" name="downloadUrl" defaultValue={article?.downloadUrl ?? ""} placeholder="/uploads/emag/issue.pdf" />
            </div>
          </div>
        </AdminCard>

        <Button type="submit" size="lg" className="w-full">
          Save article
        </Button>
      </div>
    </form>
  );
}
