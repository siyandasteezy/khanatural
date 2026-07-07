import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "gold" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-kelp-800 text-sand-50 hover:bg-kelp-700",
  gold: "bg-gold-500 text-kelp-950 hover:bg-gold-400",
  outline: "border border-kelp-800 text-kelp-900 hover:bg-kelp-800 hover:text-sand-50",
  ghost: "text-kelp-900 hover:bg-kelp-100",
  light: "bg-sand-50 text-kelp-900 hover:bg-sand-200",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs uppercase",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-sm uppercase",
};

type CommonProps = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: CommonProps & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
