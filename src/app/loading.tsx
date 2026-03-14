import { AppShell } from "@/components/ui/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <div className="animate-pulse space-y-6">
        <div>
          <div className="h-7 w-80 bg-surface-subtle" />
          <div className="mt-2 h-4 w-96 bg-surface-subtle" />
        </div>

        <div className="border-b border-line pb-4">
          <div className="h-4 w-48 bg-surface-subtle" />
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="h-10 w-56 border border-line bg-background" />
            <div className="h-10 w-56 border border-line bg-background" />
            <div className="h-10 w-56 border border-line bg-background" />
          </div>
        </div>

        <div>
          <div className="border-b border-line px-4 py-3">
            <div className="h-4 w-40 bg-surface-subtle" />
            <div className="mt-2 h-5 w-96 bg-surface-subtle" />
          </div>
          <div className="border-b border-line bg-surface-subtle px-4 py-3">
            <div className="h-3 w-full" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-3">
              <div className="h-4 w-8 bg-surface-subtle" />
              <div className="h-4 w-48 bg-surface-subtle" />
              <div className="h-4 w-32 bg-surface-subtle" />
              <div className="h-4 w-12 bg-surface-subtle" />
              <div className="h-4 w-16 bg-surface-subtle" />
              <div className="h-4 w-20 bg-surface-subtle" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
