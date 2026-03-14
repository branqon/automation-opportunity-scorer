import { AppShell } from "@/components/ui/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <div className="animate-pulse space-y-6">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="border border-line bg-surface p-5 shadow-card sm:p-6">
            <div className="h-3 w-48 bg-surface-subtle" />
            <div className="mt-4 h-8 w-80 bg-surface-subtle" />
            <div className="mt-3 h-4 w-full max-w-2xl bg-surface-subtle" />
            <div className="mt-5 h-3 w-72 bg-surface-subtle" />
            <div className="mt-5 flex gap-2">
              <div className="h-7 w-48 border border-line bg-surface-subtle" />
              <div className="h-7 w-44 border border-line bg-surface-subtle" />
              <div className="h-7 w-40 border border-line bg-surface-subtle" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-line bg-surface px-4 py-4 shadow-card">
              <div className="h-3 w-28 bg-surface-subtle" />
              <div className="mt-3 h-7 w-16 bg-surface-subtle" />
              <div className="mt-1 h-3 w-32 bg-surface-subtle" />
            </div>
            <div className="border border-line bg-surface px-4 py-4 shadow-card">
              <div className="h-3 w-32 bg-surface-subtle" />
              <div className="mt-3 h-7 w-20 bg-surface-subtle" />
              <div className="mt-1 h-3 w-28 bg-surface-subtle" />
            </div>
            <div className="border border-line bg-surface px-4 py-4 shadow-card">
              <div className="h-3 w-24 bg-surface-subtle" />
              <div className="mt-3 h-7 w-24 bg-surface-subtle" />
              <div className="mt-1 h-3 w-36 bg-surface-subtle" />
            </div>
            <div className="border border-line bg-surface px-4 py-4 shadow-card">
              <div className="h-3 w-24 bg-surface-subtle" />
              <div className="mt-3 h-7 w-12 bg-surface-subtle" />
              <div className="mt-1 h-3 w-32 bg-surface-subtle" />
            </div>
          </div>
        </section>

        <div className="border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="h-3 w-36 bg-surface-subtle" />
          <div className="mt-2 h-5 w-80 bg-surface-subtle" />
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="h-11 border border-line bg-surface-subtle" />
            <div className="h-11 border border-line bg-surface-subtle" />
            <div className="h-11 border border-line bg-surface-subtle" />
            <div className="h-11 border border-line bg-surface-subtle" />
          </div>
        </div>

        <div className="border border-line bg-surface shadow-card">
          <div className="border-b border-line bg-surface-subtle/60 px-4 py-4 sm:px-5">
            <div className="h-3 w-36 bg-surface-subtle" />
            <div className="mt-2 h-5 w-96 bg-surface-subtle" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-3">
              <div className="h-7 w-10 bg-surface-subtle" />
              <div className="h-4 w-40 bg-surface-subtle" />
              <div className="h-4 w-32 bg-surface-subtle" />
              <div className="h-5 w-12 bg-surface-subtle" />
              <div className="h-4 w-16 bg-surface-subtle" />
              <div className="h-4 w-20 bg-surface-subtle" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
