import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from "react";

const fieldClass =
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-kelp-600";

// ref is included so callers can read the value imperatively (React 19 passes
// it straight through as a prop — no forwardRef needed)
export function Input({ className = "", ...props }: ComponentPropsWithRef<"input">) {
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
