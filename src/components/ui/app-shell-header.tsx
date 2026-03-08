"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { SettingsModal } from "@/components/ui/settings-modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AppShellHeader() {
  return (
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
          <Link
            href="/opportunities/new"
            className="flex items-center gap-1.5 rounded-full border border-line/70 bg-surface px-3 py-1.5 transition hover:border-accent hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Opportunity
          </Link>
          <ThemeToggle />
          <SettingsModal />
        </div>
      </div>
    </header>
  );
}
