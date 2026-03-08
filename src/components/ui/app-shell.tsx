import type { ReactNode } from "react";
import Link from "next/link";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-sm font-bold text-background shadow-[0_12px_30px_rgba(19,31,28,0.12)]">
              AO
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Automation opportunity scorer
              </p>
              <p className="font-display text-lg font-semibold text-foreground">
                Internal prioritization cockpit
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span className="rounded-full border border-line/70 bg-surface px-3 py-1.5">
              Seeded dataset
            </span>
            <span className="rounded-full border border-line/70 bg-surface px-3 py-1.5">
              Deterministic scoring
            </span>
            <span className="rounded-full border border-line/70 bg-surface px-3 py-1.5">
              Prisma + SQLite
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>

      <footer className="border-t border-line/70 bg-surface/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            Built to answer one decision-support question well: what should we
            automate next?
          </p>
          <p>
            This project prioritizes automation investment. It does not execute
            workflows or replace a ticketing platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
