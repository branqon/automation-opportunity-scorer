import Link from "next/link";

import { AppShell } from "@/components/ui/app-shell";
import { SurfaceCard } from "@/components/ui/surface-card";

export default function NotFound() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <SurfaceCard className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Not found
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-foreground">
            That opportunity record does not exist
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            The seeded dataset may have changed or the URL is incorrect. Return
            to the ranked dashboard to browse the current portfolio.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition hover:scale-[1.01] hover:bg-accent-strong"
          >
            Return to dashboard
          </Link>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
