import { prisma } from "@/lib/prisma";
import { AdminCard, AdminTable, AdminTitle, tdClass } from "@/components/admin/ui";

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminTitle title={`Newsletter subscribers (${subscribers.length})`} />
      {subscribers.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-ink/60">No subscribers yet — signups from the homepage form will appear here.</p>
        </AdminCard>
      ) : (
        <AdminTable head={["Email", "Subscribed"]}>
          {subscribers.map((s) => (
            <tr key={s.id} className="hover:bg-sand-50">
              <td className={`${tdClass} font-semibold text-kelp-900`}>{s.email}</td>
              <td className={`${tdClass} text-ink/50`}>{s.createdAt.toLocaleDateString("en-ZA")}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
