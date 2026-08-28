import type { ReactNode } from "react";

export function AdminTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">{title}</h1>
      {action}
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200 ${className}`}>{children}</div>;
}

export function SavedNotice({ show, text = "Saved." }: { show: boolean; text?: string }) {
  if (!show) return null;
  return (
    <p role="status" className="mb-4 rounded-xl bg-kelp-100 px-4 py-3 text-sm font-semibold text-kelp-800">
      {text}
    </p>
  );
}

export const thClass = "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink/50";
export const tdClass = "px-4 py-3 text-sm";

export function AdminTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-sand-200">
      <table className="w-full min-w-160 divide-y divide-sand-200">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className={thClass}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">{children}</tbody>
      </table>
    </div>
  );
}

const statusTones: Record<string, string> = {
  PENDING: "bg-gold-300/40 text-gold-700",
  PAID: "bg-kelp-100 text-kelp-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-kelp-200 text-kelp-900",
  CANCELLED: "bg-red-100 text-red-800",
  // payment states (PAID is shared with the fulfilment scale above)
  UNPAID: "bg-sand-200 text-ink/70",
  AWAITING: "bg-gold-300/40 text-gold-700",
  FAILED: "bg-red-100 text-red-800",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusTones[status] ?? "bg-sand-100 text-ink/60"}`}>
      {status.toLowerCase()}
    </span>
  );
}
