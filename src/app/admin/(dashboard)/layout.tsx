import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

const nav = [
  { label: "Overview", href: "/admin/" },
  { label: "Products", href: "/admin/products/" },
  { label: "Orders", href: "/admin/orders/" },
  { label: "Articles", href: "/admin/articles/" },
  { label: "Media", href: "/admin/media/" },
  { label: "SEO", href: "/admin/seo/" },
  { label: "Subscribers", href: "/admin/subscribers/" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-sand-200 bg-kelp-950 text-sand-50">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6 overflow-x-auto">
            <Link href="/admin/" className="shrink-0 font-[family-name:var(--font-display)] font-semibold">
              Khanatural Admin
            </Link>
            <nav aria-label="Admin" className="flex items-center gap-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sand-200 hover:bg-kelp-800 hover:text-gold-300"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/" className="hidden text-xs text-sand-200/70 hover:text-gold-300 sm:block">
              View site ↗
            </Link>
            <span className="hidden text-xs text-sand-200/70 md:block">{session.email}</span>
            <form action={logout}>
              <button type="submit" className="rounded-full border border-sand-200/30 px-3 py-1.5 text-xs font-semibold hover:border-gold-400 hover:text-gold-300">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
