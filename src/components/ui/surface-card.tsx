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
      className={`border border-line bg-surface p-4 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
