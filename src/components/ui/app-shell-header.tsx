import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function AppShellHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/78 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border border-line bg-surface shadow-card">
            <span className="h-2.5 w-2.5 bg-accent shadow-[0_0_18px_var(--accent-glow)]" />
          </span>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition group-hover:text-accent-strong">
              Automation opportunity scorer
            </p>
            <p className="text-sm font-semibold text-foreground sm:text-[15px]">
              Prioritization cockpit
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden border border-line bg-surface-subtle px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:block">
            Read-only portfolio build
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
