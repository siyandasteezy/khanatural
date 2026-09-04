import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct, deleteProduct } from "@/app/admin/actions";
import { AdminCard, AdminTitle, SavedNotice } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

const IMAGE_NOTICE: Record<string, string> = {
  added: "Image added.",
  removed: "Image removed.",
  primary: "Main image updated.",
  alt: "Image description saved.",
  nofile: "No file was chosen, so nothing was uploaded.",
  failed: "That image couldn’t be uploaded. Please try another file.",
};

export default async function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; image?: string }>;
}) {
  const [{ id }, { saved, image }] = await Promise.all([params, searchParams]);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, categories: true, tags: true },
  });
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);
  const remove = deleteProduct.bind(null, product.id);

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
      <SavedNotice show={saved === "1"} text="Product saved." />
      {image && <SavedNotice show text={IMAGE_NOTICE[image] ?? "Image updated."} />}
      {/* One grid holds the whole page. The product form is only the left
          column: the pricing and availability controls sit in the sidebar and
          are tied back to it with form="product-form", which is what lets the
          Images panel — whose upload and remove are their own server actions,
          so it cannot be nested inside a form — sit in the sidebar too. */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <form id="product-form" action={action} className="space-y-6">
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
        </form>

        <div className="space-y-6">
          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Pricing</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="p-regular">Regular price (R)</Label>
                <Input
                  id="p-regular"
                  form="product-form"
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
                  form="product-form"
                  name="salePrice"
                  defaultValue={product.salePriceCents ? (product.salePriceCents / 100).toFixed(2) : ""}
                  inputMode="decimal"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-kelp-900">
                <input type="checkbox" form="product-form" name="onSale" defaultChecked={product.onSale} className="h-4 w-4 accent-kelp-700" />
                On sale
              </label>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Availability</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-kelp-900">
                <input type="checkbox" form="product-form" name="inStock" defaultChecked={product.inStock} className="h-4 w-4 accent-kelp-700" />
                In stock
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-kelp-900">
                <input type="checkbox" form="product-form" name="isPublished" defaultChecked={product.isPublished} className="h-4 w-4 accent-kelp-700" />
                Published on site
              </label>
            </div>
          </AdminCard>

          <Button type="submit" form="product-form" size="lg" className="w-full">
            Save product
          </Button>

          <AdminCard>
            <h2 className="mb-1 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Images</h2>
            <p className="mb-4 text-xs text-ink/50">
              The first image is used on the shop grid and social previews. Changes here save straight away.
            </p>
            <ProductImageManager
              productId={product.id}
              images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
            />
          </AdminCard>
        </div>

        {/* Destructive action last, and under the main column rather than the
            sidebar, so it is nowhere near the Save button. */}
        <div className="lg:col-start-1">
          <AdminCard className="border-red-200 bg-red-50/40">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">
              Delete this product
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Removes “{product.name}” from the shop for good, along with its images. Past orders keep their record of it,
              so your order history and totals stay correct.
            </p>
            <form action={remove} className="mt-4">
              <DeleteProductButton name={product.name} />
            </form>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
