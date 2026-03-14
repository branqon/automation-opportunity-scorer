import type { ReactNode } from "react";
import { AppShellHeader } from "@/components/ui/app-shell-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(127,155,184,0.18),transparent_58%)]"
      />
      <AppShellHeader />

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>

      <footer className="relative mt-8 border-t border-line bg-background/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            Built to answer one decision-support question well: what should we
            automate next?
          </p>
          <p>
            Deterministic scoring with visible ROI assumptions.
          </p>
        </div>
      </footer>
    </div>
  );
}
