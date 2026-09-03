import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatZar } from "@/lib/money";
import { AdminTable, AdminTitle, SavedNotice, tdClass } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { saved, deleted } = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, categories: true },
  });

  return (
    <>
      <AdminTitle title="Products" />
      <SavedNotice show={saved === "1"} text="Product saved." />
      <SavedNotice show={deleted === "1"} text="Product deleted. Past orders that included it are unaffected." />
      <AdminTable head={["Product", "Category", "Price", "Stock", "Visibility", ""]}>
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-sand-50">
            <td className={tdClass}>
              <div className="flex items-center gap-3">
                {p.images[0] && (
                  <Image src={p.images[0].url} alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" />
                )}
                <span className="font-semibold text-kelp-900">{p.name}</span>
              </div>
            </td>
            <td className={`${tdClass} text-ink/60`}>
              {p.categories
                .filter((c) => c.slug !== "uncategorised")
                .map((c) => c.name)
                .join(", ")}
            </td>
            <td className={tdClass}>
              {formatZar(p.priceCents)}
              {p.onSale && <span className="ml-2 text-xs text-gold-600">(sale)</span>}
            </td>
            <td className={tdClass}>{p.inStock ? <Badge>In stock</Badge> : <Badge tone="out">Out</Badge>}</td>
            <td className={tdClass}>{p.isPublished ? "Published" : <span className="text-ink/40">Hidden</span>}</td>
            <td className={`${tdClass} text-right`}>
              <Link href={`/admin/products/${p.id}/`} className="font-semibold text-kelp-700 hover:underline">
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
