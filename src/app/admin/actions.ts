"use server";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus, ArticleKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, destroySession } from "@/lib/auth";
import { reconcileOrderWithYoco } from "@/lib/payments";
import { saveImage, deleteImage } from "@/lib/media";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

/** Parse a rands decimal string ("250" or "250.50") into integer cents. */
function randsToCents(value: string): number | null {
  if (!value) return null;
  const n = Number(value.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login/");
}

// ---------- products ----------

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const regular = randsToCents(str(formData, "regularPrice"));
  const sale = randsToCents(str(formData, "salePrice"));
  const onSale = formData.get("onSale") === "on" && sale !== null;
  if (regular === null) throw new Error("Regular price is required");

  await prisma.product.update({
    where: { id },
    data: {
      name: str(formData, "name"),
      sku: str(formData, "sku") || null,
      regularPriceCents: regular,
      salePriceCents: onSale ? sale : null,
      onSale,
      priceCents: onSale && sale !== null ? sale : regular,
      inStock: formData.get("inStock") === "on",
      isPublished: formData.get("isPublished") === "on",
      shortDescription: str(formData, "shortDescription"),
      description: str(formData, "description"),
      seoTitle: str(formData, "seoTitle") || null,
      seoDescription: str(formData, "seoDescription") || null,
    },
  });

  revalidatePath("/", "layout"); // product data appears on home, shop, category and product pages
  redirect("/admin/products/?saved=1");
}

/**
 * Delete a product.
 *
 * Order history survives this: OrderItem holds its own name and price snapshot
 * and its product relation is SetNull, so past orders still read correctly for
 * a product that no longer exists. Its images cascade away with it, and any
 * files this admin uploaded for it are removed from storage too — migrated
 * artwork under /images/ is left alone, since other products may share it.
 */
export async function deleteProduct(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, images: { select: { url: true } } },
  });
  if (!product) redirect("/admin/products/");

  await Promise.all(product.images.map((img) => deleteImage(img.url)));
  await prisma.product.delete({ where: { id } });

  revalidatePath("/", "layout"); // the product appears on home, shop and category pages
  redirect("/admin/products/?deleted=1");
}

// ---------- product images ----------

export async function addProductImage(productId: string, formData: FormData) {
  await requireAdmin();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/products/${productId}/?image=nofile`);
  }

  let url: string;
  try {
    ({ url } = await saveImage(file));
  } catch (err) {
    console.error("[admin] product image upload failed", err);
    redirect(`/admin/products/${productId}/?image=failed`);
  }

  const last = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await prisma.productImage.create({
    data: {
      productId,
      url,
      alt: str(formData, "alt"),
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}/?image=added`);
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: { url: true, productId: true },
  });
  if (!image) redirect("/admin/products/");

  await prisma.productImage.delete({ where: { id: imageId } });
  // Only removes files this admin uploaded; a migrated /images/ path is shared
  // artwork and stays put.
  await deleteImage(image.url);

  revalidatePath("/", "layout");
  redirect(`/admin/products/${image.productId}/?image=removed`);
}

/** Move an image to the front — the first image is the one used everywhere else. */
export async function makeProductImagePrimary(imageId: string) {
  await requireAdmin();
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: { productId: true },
  });
  if (!image) redirect("/admin/products/");

  const images = await prisma.productImage.findMany({
    where: { productId: image.productId },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  const reordered = [imageId, ...images.map((i) => i.id).filter((id) => id !== imageId)];
  await prisma.$transaction(
    reordered.map((id, index) => prisma.productImage.update({ where: { id }, data: { sortOrder: index } })),
  );

  revalidatePath("/", "layout");
  redirect(`/admin/products/${image.productId}/?image=primary`);
}

export async function updateProductImageAlt(imageId: string, formData: FormData) {
  await requireAdmin();
  const image = await prisma.productImage.update({
    where: { id: imageId },
    data: { alt: str(formData, "alt") },
    select: { productId: true },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${image.productId}/?image=alt`);
}

// ---------- orders ----------

export async function updateOrderStatus(id: string, formData: FormData) {
  await requireAdmin();
  const status = str(formData, "status") as OrderStatus;
  if (!Object.values(OrderStatus).includes(status)) throw new Error("Invalid status");
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}/?saved=1`);
}

/**
 * Ask Yoco again whether this order's checkout was paid.
 *
 * For an order stuck on AWAITING because its webhook never arrived or never
 * matched — the payment event carries no checkout id, so matching relies on
 * optional metadata. This settles it from the checkout itself, which is
 * authoritative, so nobody has to reconcile by hand against the dashboard.
 */
export async function recheckOrderPayment(id: string) {
  await requireAdmin();
  let outcome: string;
  try {
    outcome = await reconcileOrderWithYoco(id);
  } catch (err) {
    console.error("[admin] payment re-check failed", err);
    outcome = "error";
  }
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}/?payment=${outcome}`);
}

// ---------- articles ----------

const MAX_PDF_BYTES = 50 * 1024 * 1024;
// Netlify functions reject request bodies over ~6MB, so uploads there must be
// compressed exports; self-hosted `next start` can take the full 50MB.
const MAX_NETLIFY_PDF_BYTES = 5 * 1024 * 1024 + 512 * 1024;

/**
 * Persist an uploaded e-Mag PDF and return its public URL, or null when no
 * file was chosen. Self-hosted (`next start`) writes to public/uploads/emag/,
 * which is served from disk at request time. On Netlify the filesystem is
 * read-only, so the PDF goes to Netlify Blobs and is served back through
 * /api/emag-pdf/[slug]/.
 */
async function saveEmagPdf(formData: FormData, slug: string): Promise<string | null> {
  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("The e-Mag upload must be a PDF file");
  }
  if (file.size > MAX_PDF_BYTES) throw new Error("PDF is too large (max 50MB)");

  if (process.env.NETLIFY) {
    if (file.size > MAX_NETLIFY_PDF_BYTES) {
      throw new Error("On Netlify hosting, e-Mag PDFs must be under ~5.5MB — export a compressed PDF and retry");
    }
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("emag");
    await store.set(`${slug}.pdf`, await file.arrayBuffer(), {
      metadata: { contentType: "application/pdf", uploadedAt: new Date().toISOString() },
    });
    return `/api/emag-pdf/${slug}/`;
  }

  const dir = join(process.cwd(), "public", "uploads", "emag");
  await mkdir(dir, { recursive: true });
  const filename = `${slug}.pdf`;
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/emag/${filename}`;
}

async function articleDataFromForm(formData: FormData) {
  const kind = str(formData, "kind") as ArticleKind;
  return {
    kind: Object.values(ArticleKind).includes(kind) ? kind : ArticleKind.ARTICLE,
    title: str(formData, "title"),
    slug: slugify(str(formData, "slug") || str(formData, "title")),
    excerpt: str(formData, "excerpt"),
    content: str(formData, "content"),
    coverImage: str(formData, "coverImage") || null,
    downloadUrl: str(formData, "downloadUrl") || null,
    isPublished: formData.get("isPublished") === "on",
    publishedAt: str(formData, "publishedAt") ? new Date(str(formData, "publishedAt")) : new Date(),
    seoTitle: str(formData, "seoTitle") || null,
    seoDescription: str(formData, "seoDescription") || null,
  };
}

export async function createArticle(formData: FormData) {
  await requireAdmin();
  const data = await articleDataFromForm(formData);
  const uploadedPdf = await saveEmagPdf(formData, data.slug);
  if (uploadedPdf) data.downloadUrl = uploadedPdf;
  await prisma.article.create({ data });
  revalidatePath("/media");
  revalidatePath("/");
  redirect("/admin/articles/?saved=1");
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAdmin();
  const data = await articleDataFromForm(formData);
  const uploadedPdf = await saveEmagPdf(formData, data.slug);
  if (uploadedPdf) data.downloadUrl = uploadedPdf;
  await prisma.article.update({ where: { id }, data });
  revalidatePath("/media");
  revalidatePath("/");
  redirect("/admin/articles/?saved=1");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/media");
  revalidatePath("/");
  redirect("/admin/articles/?deleted=1");
}

// ---------- page SEO ----------

export async function updatePageSeo(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.page.update({
    where: { id },
    data: {
      metaTitle: str(formData, "metaTitle") || null,
      metaDescription: str(formData, "metaDescription") || null,
    },
  });
  revalidatePath("/", "layout");
  redirect("/admin/seo/?saved=1");
}
