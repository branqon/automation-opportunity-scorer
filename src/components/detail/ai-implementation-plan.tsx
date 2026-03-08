"use client";

import { useCallback, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Lightbulb, RefreshCw, Rocket, Shield, Sparkles, Target, Wrench } from "lucide-react";

import { useApiKeys } from "@/components/providers/api-key-provider";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/surface-card";

type Phase = {
  name: string;
  duration: string;
  tasks: string[];
  deliverables: string[];
};

type Risk = {
  risk: string;
  mitigation: string;
};

type ImplementationPlan = {
  phases: Phase[];
  toolsAndPlatforms: string[];
  estimatedTotalEffort: string;
  risks: Risk[];
  successMetrics: string[];
  quickWins: string[];
};

type PlanMeta = {
  provider: string;
  model: string;
};

type AiImplementationPlanProps = {
  slug: string;
  cachedPlan: string | null;
};

export function AiImplementationPlan({ slug, cachedPlan }: AiImplementationPlanProps) {
  const { isConfigured, activeKey, provider } = useApiKeys();
  const [plan, setPlan] = useState<ImplementationPlan | null>(() => {
    if (cachedPlan) {
      try {
        return JSON.parse(cachedPlan) as ImplementationPlan;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [meta, setMeta] = useState<PlanMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/implementation-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": activeKey,
          "x-ai-provider": provider,
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setPlan(data.plan);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate implementation plan");
    } finally {
      setLoading(false);
    }
  }, [activeKey, provider, slug]);

  return (
    <SurfaceCard className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent" />
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              AI Implementation Plan
            </h2>
            {meta && (
              <Badge variant="accent" className="mt-1">
                {meta.provider} / {meta.model}
              </Badge>
            )}
          </div>
        </div>

        {plan ? (
          <button
            type="button"
            onClick={generate}
            disabled={loading || !isConfigured}
            className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-strong transition hover:bg-accent-soft/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        ) : null}
      </div>

      {!plan && !loading && !error && (
        <div className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-semibold text-foreground">
            Generate an AI-powered implementation plan
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Get a detailed phased plan, risk assessment, success metrics, and quick wins tailored to this opportunity.
          </p>
          {isConfigured ? (
            <button
              type="button"
              onClick={generate}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              <Sparkles className="h-4 w-4" />
              Generate AI Analysis
            </button>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Configure an API key in settings to generate AI analysis.
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border border-accent/15 bg-accent-soft/60 p-8 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-accent" />
          <p className="mt-4 text-lg font-semibold text-accent-strong">
            Generating implementation plan...
          </p>
          <p className="mt-2 text-sm text-accent-strong/70">
            This may take a moment while the AI analyzes the opportunity.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
            <div>
              <p className="font-semibold text-rose-700">Failed to generate plan</p>
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

      {plan && !loading && (
        <div className="space-y-6">
          {/* Phases */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-accent" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Implementation Phases
              </h3>
            </div>
            {plan.phases.map((phase, index) => (
              <div
                key={phase.name}
                className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-semibold text-foreground">{phase.name}</h4>
                      <Badge variant="neutral">
                        <Clock className="mr-1 h-3 w-3" />
                        {phase.duration}
                      </Badge>
                    </div>

                    {phase.tasks.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Tasks
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {phase.tasks.map((task) => (
                            <li
                              key={task}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.deliverables.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Deliverables
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {phase.deliverables.map((deliverable) => (
                            <li
                              key={deliverable}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              {deliverable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tools & Platforms */}
          {plan.toolsAndPlatforms.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Tools & Platforms
                </h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.toolsAndPlatforms.map((tool) => (
                  <Badge key={tool} variant="accent">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Effort */}
          <div className="rounded-3xl border border-accent/15 bg-accent-soft/60 p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent-strong" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
                Estimated Total Effort
              </p>
            </div>
            <p className="mt-2 font-display text-2xl font-semibold text-accent-strong">
              {plan.estimatedTotalEffort}
            </p>
          </div>

          {/* Risks */}
          {plan.risks.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Risks & Mitigations
                </h3>
              </div>
              <div className="mt-3 space-y-3">
                {plan.risks.map((item) => (
                  <div
                    key={item.risk}
                    className="rounded-3xl border border-line/80 bg-surface-subtle/70 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <div>
                        <p className="font-semibold text-foreground">{item.risk}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-semibold text-emerald-600">Mitigation:</span>{" "}
                          {item.mitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Metrics */}
          {plan.successMetrics.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Success Metrics
                </h3>
              </div>
              <ul className="mt-3 space-y-2">
                {plan.successMetrics.map((metric) => (
                  <li
                    key={metric}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Wins */}
          {plan.quickWins.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Quick Wins
                </h3>
              </div>
              <div className="mt-3 space-y-2">
                {plan.quickWins.map((win) => (
                  <div
                    key={win}
                    className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4"
                  >
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">{win}</p>
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
