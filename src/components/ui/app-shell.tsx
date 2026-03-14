import type { ReactNode } from "react";
import { AppShellHeader } from "@/components/ui/app-shell-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <AppShellHeader />

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>

      <footer className="border-t border-line bg-background/65 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            Built to answer one decision-support question well: what should we
            automate next?
          </p>
          <p>
            Deterministic scoring with visible ROI assumptions and shareable
            what-if scenarios.
          </p>
        </div>
      </footer>
    </div>
  );
}
