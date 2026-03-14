import { AppShell } from "@/components/ui/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)]">
          <div className="rounded-card border border-line/80 bg-surface p-8 shadow-card">
            <div className="h-6 w-40 bg-surface-subtle" />
            <div className="mt-6 h-14 max-w-3xl bg-surface-subtle" />
            <div className="mt-4 h-24 max-w-4xl bg-surface-subtle" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="h-36 bg-surface-subtle" />
              <div className="h-36 bg-surface-subtle" />
              <div className="h-36 bg-surface-subtle" />
            </div>
          </div>
          <div className="rounded-card border border-line/80 bg-surface p-8 shadow-card">
            <div className="h-10 w-48 bg-surface-subtle" />
            <div className="mt-6 h-24 bg-surface-subtle" />
            <div className="mt-4 h-24 bg-surface-subtle" />
            <div className="mt-4 h-24 bg-surface-subtle" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-40 rounded-card bg-surface" />
          <div className="h-40 rounded-card bg-surface" />
          <div className="h-40 rounded-card bg-surface" />
          <div className="h-40 rounded-card bg-surface" />
        </div>

        <div className="h-96 rounded-card bg-surface" />
      </div>
    </AppShell>
  );
}
