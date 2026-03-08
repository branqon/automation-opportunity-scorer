import type { ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "critical";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: "border-line/80 bg-surface-subtle text-muted-foreground",
  accent: "border-accent/20 bg-accent-soft text-accent-strong",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  critical: "border-rose-200 bg-rose-50 text-rose-700",
};

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
