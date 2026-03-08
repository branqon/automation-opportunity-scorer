"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12">
      <div className="w-full rounded-card border border-line/80 bg-surface p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Application error
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-foreground">
          The automation portfolio view could not be loaded
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {error.message ||
            "A route-level error interrupted the page. Retry the request or verify the local database is seeded."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition hover:scale-[1.01] hover:bg-accent-strong"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
