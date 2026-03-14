import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({
  children,
  className = "",
}: SurfaceCardProps) {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
