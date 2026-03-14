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
      className={`relative overflow-hidden border border-line bg-surface p-5 shadow-card transition-shadow duration-200 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(211,222,234,0.22),transparent)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
