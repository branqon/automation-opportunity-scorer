import Link from "next/link";

export function AppShellHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            AO
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Automation opportunity scorer
            </p>
            <p className="text-sm font-semibold text-foreground">
              Prioritization cockpit
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
