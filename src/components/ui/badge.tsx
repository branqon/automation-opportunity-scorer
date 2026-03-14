import type { ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "critical";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: "border-line bg-surface-subtle text-muted-foreground",
  accent: "border-accent/20 bg-accent-soft text-accent-strong",
  success:
    "border-[color:var(--semantic-success-border)] bg-[color:var(--semantic-success-bg)] text-[color:var(--semantic-success-text)]",
  warning:
    "border-[color:var(--semantic-warning-border)] bg-[color:var(--semantic-warning-bg)] text-[color:var(--semantic-warning-text)]",
  critical:
    "border-[color:var(--semantic-critical-border)] bg-[color:var(--semantic-critical-bg)] text-[color:var(--semantic-critical-text)]",
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
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
