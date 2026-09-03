import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/app/admin/actions";
import { AdminCard, AdminTitle } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, categories: true, tags: true },
  });
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <>
      <AdminTitle
        title={product.name}
        action={
          <Link href={`/product/${product.slug}/`} className="text-sm font-semibold text-kelp-700 hover:underline">
            View on site ↗
          </Link>
        }
      />
      <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AdminCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="p-name">Name</Label>
                <Input id="p-name" name="name" defaultValue={product.name} required />
              </div>
              <div>
                <Label htmlFor="p-sku">SKU</Label>
                <Input id="p-sku" name="sku" defaultValue={product.sku ?? ""} />
              </div>
              <div>
                <Label htmlFor="p-slug">Slug (URL — fixed to preserve SEO)</Label>
                <Input id="p-slug" value={product.slug} disabled />
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Content</h2>
            <div className="space-y-5">
              <div>
                <Label htmlFor="p-short">Short description</Label>
                <p className="mb-2 text-xs text-ink/50">
                  The summary beside the product photo. Use the buttons to format — no code needed.
                </p>
                <RichTextEditor
                  name="shortDescription"
                  defaultValue={product.shortDescription}
                  minHeight="7rem"
                  ariaLabel="Short description"
                />
              </div>
              <div>
                <Label htmlFor="p-desc">Full description</Label>
                <p className="mb-2 text-xs text-ink/50">The longer description further down the product page.</p>
                <RichTextEditor
                  name="description"
                  defaultValue={product.description}
                  minHeight="14rem"
                  ariaLabel="Full description"
                />
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">SEO</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="p-seo-title">SEO title (defaults to product name)</Label>
                <Input id="p-seo-title" name="seoTitle" defaultValue={product.seoTitle ?? ""} />
              </div>
              <div>
                <Label htmlFor="p-seo-desc">Meta description</Label>
                <Textarea id="p-seo-desc" name="seoDescription" defaultValue={product.seoDescription ?? ""} rows={3} />
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Pricing</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="p-regular">Regular price (R)</Label>
                <Input
                  id="p-regular"
                  name="regularPrice"
                  defaultValue={(product.regularPriceCents / 100).toFixed(2)}
                  inputMode="decimal"
                  required
                />
              </div>
              <div>
                <Label htmlFor="p-sale">Sale price (R)</Label>
                <Input
                  id="p-sale"
                  name="salePrice"
                  defaultValue={product.salePriceCents ? (product.salePriceCents / 100).toFixed(2) : ""}
                  inputMode="decimal"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-kelp-900">
                <input type="checkbox" name="onSale" defaultChecked={product.onSale} className="h-4 w-4 accent-kelp-700" />
                On sale
              </label>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Availability</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-kelp-900">
                <input type="checkbox" name="inStock" defaultChecked={product.inStock} className="h-4 w-4 accent-kelp-700" />
                In stock
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-kelp-900">
                <input type="checkbox" name="isPublished" defaultChecked={product.isPublished} className="h-4 w-4 accent-kelp-700" />
                Published on site
              </label>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Images</h2>
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((img) => (
                <Image key={img.id} src={img.url} alt={img.alt} width={96} height={96} className="aspect-square w-full rounded-xl object-cover" />
              ))}
            </div>
            <p className="mt-3 text-xs text-ink/50">Manage image files in the Media section.</p>
          </AdminCard>

          <Button type="submit" size="lg" className="w-full">
            Save product
          </Button>
        </div>
      </form>
    </>
  );
}
