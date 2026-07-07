import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatZar } from "@/lib/money";
import { AdminCard, AdminTable, AdminTitle, StatusPill, tdClass } from "@/components/admin/ui";

export default async function AdminOverviewPage() {
  const [productCount, inStockCount, orderCount, pendingOrders, subscriberCount, revenue, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { inStock: true, isPublished: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.newsletterSubscriber.count(),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: { notIn: ["CANCELLED"] } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { _count: { select: { items: true } } } }),
  ]);

  const stats = [
    { label: "Products", value: String(productCount), href: "/admin/products/" },
    { label: "In stock", value: String(inStockCount), href: "/admin/products/" },
    { label: "Orders", value: String(orderCount), href: "/admin/orders/" },
    { label: "Pending orders", value: String(pendingOrders), href: "/admin/orders/" },
    { label: "Revenue", value: formatZar(revenue._sum.totalCents ?? 0), href: "/admin/orders/" },
    { label: "Subscribers", value: String(subscriberCount), href: "/admin/subscribers/" },
  ];

  return (
    <>
      <AdminTitle title="Overview" />
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <AdminCard className="transition-shadow hover:shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/50">{s.label}</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">{s.value}</p>
            </AdminCard>
          </Link>
        ))}
      </div>

      <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Recent orders</h2>
      {recentOrders.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-ink/60">No orders yet. They’ll appear here as customers check out.</p>
        </AdminCard>
      ) : (
        <AdminTable head={["Order", "Customer", "Items", "Total", "Status", "Placed"]}>
          {recentOrders.map((o) => (
            <tr key={o.id} className="hover:bg-sand-50">
              <td className={tdClass}>
                <Link href={`/admin/orders/${o.id}/`} className="font-semibold text-kelp-700 hover:underline">
                  #{o.orderNumber}
                </Link>
              </td>
              <td className={tdClass}>{o.customerName}</td>
              <td className={tdClass}>{o._count.items}</td>
              <td className={tdClass}>{formatZar(o.totalCents)}</td>
              <td className={tdClass}>
                <StatusPill status={o.status} />
              </td>
              <td className={`${tdClass} text-ink/50`}>{o.createdAt.toLocaleDateString("en-ZA")}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
