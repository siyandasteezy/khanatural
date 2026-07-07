import type { ComponentPropsWithoutRef } from "react";

const fieldClass =
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-kelp-600";

export function Input({ className = "", ...props }: ComponentPropsWithoutRef<"input">) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={`${fieldClass} min-h-28 ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentPropsWithoutRef<"select">) {
  return <select className={`${fieldClass} ${className}`} {...props} />;
}

export function Label({ className = "", ...props }: ComponentPropsWithoutRef<"label">) {
  return <label className={`mb-1.5 block text-sm font-semibold text-kelp-900 ${className}`} {...props} />;
}
