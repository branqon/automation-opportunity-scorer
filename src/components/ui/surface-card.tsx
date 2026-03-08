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
      className={`rounded-card border border-line/80 bg-surface/95 p-6 shadow-card backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}
