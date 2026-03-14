import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function AppShellHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Automation opportunity scorer
            </p>
            <p className="text-sm font-semibold text-foreground">
              Prioritization cockpit
            </p>
          </div>
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
