import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatZar } from "@/lib/money";
import { AdminCard, AdminTable, AdminTitle, StatusPill, tdClass } from "@/components/admin/ui";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <>
      <AdminTitle title="Orders" />
      {orders.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-ink/60">No orders yet. They’ll appear here as customers check out.</p>
        </AdminCard>
      ) : (
        <AdminTable head={["Order", "Customer", "Email", "Items", "Total", "Status", "Placed"]}>
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-sand-50">
              <td className={tdClass}>
                <Link href={`/admin/orders/${o.id}/`} className="font-semibold text-kelp-700 hover:underline">
                  #{o.orderNumber}
                </Link>
              </td>
              <td className={tdClass}>{o.customerName}</td>
              <td className={`${tdClass} text-ink/60`}>{o.customerEmail}</td>
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
