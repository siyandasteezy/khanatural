import { notFound } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatZar } from "@/lib/money";
import { updateOrderStatus } from "@/app/admin/actions";
import { AdminCard, AdminTitle, SavedNotice, StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const action = updateOrderStatus.bind(null, order.id);

  return (
    <>
      <AdminTitle title={`Order #${order.orderNumber}`} action={<StatusPill status={order.status} />} />
      <SavedNotice show={saved === "1"} text="Order updated." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Items</h2>
            <ul className="divide-y divide-sand-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                  <span>
                    {item.name} <span className="text-ink/40">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold">{formatZar(item.unitPriceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-sand-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd>{formatZar(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Delivery</dt>
                <dd>{formatZar(order.shippingCents)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold text-kelp-900">
                <dt>Total</dt>
                <dd>{formatZar(order.totalCents)}</dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Customer</h2>
            <dl className="space-y-1.5 text-sm">
              <div>
                <dt className="inline font-semibold">Name: </dt>
                <dd className="inline">{order.customerName}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Email: </dt>
                <dd className="inline">
                  <a href={`mailto:${order.customerEmail}`} className="text-kelp-700 underline">
                    {order.customerEmail}
                  </a>
                </dd>
              </div>
              {order.customerPhone && (
                <div>
                  <dt className="inline font-semibold">Phone: </dt>
                  <dd className="inline">{order.customerPhone}</dd>
                </div>
              )}
              <div className="pt-2">
                <dt className="font-semibold">Delivery address</dt>
                <dd className="text-ink/70">
                  {order.addressLine1}
                  {order.addressLine2 && (
                    <>
                      <br />
                      {order.addressLine2}
                    </>
                  )}
                  <br />
                  {order.city}, {order.province}, {order.postalCode}
                  <br />
                  {order.country}
                </dd>
              </div>
              {order.notes && (
                <div className="pt-2">
                  <dt className="font-semibold">Notes</dt>
                  <dd className="text-ink/70">{order.notes}</dd>
                </div>
              )}
            </dl>
          </AdminCard>
        </div>

        <AdminCard className="h-fit">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">Update status</h2>
          <form action={action} className="space-y-4">
            <div>
              <Label htmlFor="o-status">Status</Label>
              <Select id="o-status" name="status" defaultValue={order.status}>
                {Object.values(OrderStatus).map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Update order
            </Button>
          </form>
          <p className="mt-4 text-xs text-ink/50">Placed {order.createdAt.toLocaleString("en-ZA")}</p>
        </AdminCard>
      </div>
    </>
  );
}
