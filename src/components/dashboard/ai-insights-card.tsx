"use client";

import { useCallback, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Compass,
  Heart,
  Lightbulb,
  RefreshCw,
  Route,
  Sparkles,
} from "lucide-react";

import { useApiKeys } from "@/components/providers/api-key-provider";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/surface-card";

type Recommendation = {
  title: string;
  rationale: string;
  opportunities: string[];
};

type Pattern = {
  pattern: string;
  description: string;
};

type RoadmapPhase = {
  phase: string;
  timeframe: string;
  items: string[];
  rationale: string;
};

type PortfolioHealth = {
  overallReadiness: string;
  summary: string;
  biggestGap: string;
};

type PortfolioSummary = {
  topRecommendations: Recommendation[];
  patterns: Pattern[];
  suggestedRoadmap: RoadmapPhase[];
  portfolioHealth: PortfolioHealth;
};

type SummaryMeta = {
  provider: string;
  model: string;
};

function getReadinessBadgeVariant(readiness: string) {
  const lower = readiness.toLowerCase();
  if (lower.includes("high") || lower.includes("strong") || lower.includes("excellent")) {
    return "success" as const;
  }
  if (lower.includes("low") || lower.includes("weak") || lower.includes("poor")) {
    return "critical" as const;
  }
  return "warning" as const;
}

export function AiInsightsCard() {
  const { isConfigured, activeKey, provider } = useApiKeys();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [meta, setMeta] = useState<SummaryMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/portfolio-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": activeKey,
          "x-ai-provider": provider,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
      setMeta(data.meta);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate portfolio insights");
    } finally {
      setLoading(false);
    }
  }, [activeKey, provider]);

  if (!summary && !loading && !error) {
    return (
      <SurfaceCard className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent" />
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              AI Portfolio Insights
            </h2>
            <p className="text-sm text-muted-foreground">
              Get strategic recommendations, patterns, and a suggested roadmap powered by AI.
            </p>
          </div>
        </div>
        {isConfigured ? (
          <button
            type="button"
            onClick={generate}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            <Sparkles className="h-4 w-4" />
            Generate AI Insights
          </button>
        ) : (
          <p className="shrink-0 text-sm text-muted-foreground">
            Configure an API key in settings to unlock AI insights.
          </p>
        )}
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent" />
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              AI Portfolio Insights
            </h2>
            {meta && (
              <Badge variant="accent" className="mt-1">
                {meta.provider} / {meta.model}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {summary && (
            <>
              <button
                type="button"
                onClick={generate}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Regenerate
              </button>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 rounded-full border border-line/80 bg-surface-subtle px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-surface-subtle/80"
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-accent/15 bg-accent-soft/60 p-8 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-accent" />
          <p className="mt-4 text-lg font-semibold text-accent-strong">
            Generating portfolio insights...
          </p>
          <p className="mt-2 text-sm text-accent-strong/70">
            Analyzing all opportunities in the portfolio.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
            <div>
              <p className="font-semibold text-rose-700">Failed to generate insights</p>
              <p className="mt-1 text-sm text-rose-600">{error}</p>
              <button
                type="button"
                onClick={generate}
                disabled={loading || !isConfigured}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 transition hover:text-rose-800"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {summary && expanded && !loading && (
        <div className="space-y-6">
          {/* Portfolio Health */}
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Portfolio Health
              </h3>
            </div>
            <div className="mt-3 rounded-3xl border border-line/80 bg-surface-subtle/70 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Overall Readiness
                </p>
                <Badge variant={getReadinessBadgeVariant(summary.portfolioHealth.overallReadiness)}>
                  {summary.portfolioHealth.overallReadiness}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {summary.portfolioHealth.summary}
              </p>
              {summary.portfolioHealth.biggestGap && (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-700">
                    <span className="font-semibold">Biggest gap:</span>{" "}
                    {summary.portfolioHealth.biggestGap}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Recommendations */}
          {summary.topRecommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Top Recommendations
                </h3>
              </div>
              <div className="mt-3 space-y-3">
                {summary.topRecommendations.map((rec) => (
                  <div
                    key={rec.title}
                    className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5"
                  >
                    <h4 className="font-semibold text-foreground">{rec.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {rec.rationale}
                    </p>
                    {rec.opportunities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {rec.opportunities.map((opp) => (
                          <Badge key={opp} variant="neutral">
                            {opp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {summary.patterns.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Patterns
                </h3>
              </div>
              <div className="mt-3 space-y-3">
                {summary.patterns.map((p) => (
                  <div
                    key={p.pattern}
                    className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5"
                  >
                    <p className="font-semibold text-foreground">{p.pattern}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Roadmap */}
          {summary.suggestedRoadmap.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Suggested Roadmap
                </h3>
              </div>
              <div className="mt-3 space-y-3">
                {summary.suggestedRoadmap.map((phase, index) => (
                  <div
                    key={phase.phase}
                    className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-semibold text-foreground">{phase.phase}</h4>
                          <Badge variant="neutral">{phase.timeframe}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{phase.rationale}</p>
                        {phase.items.length > 0 && (
                          <ul className="mt-2 space-y-1.5">
                            {phase.items.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SurfaceCard>
  );
}
