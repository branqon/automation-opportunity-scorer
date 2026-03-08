"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useApiKeys } from "@/components/providers/api-key-provider";

type AnalysisData = {
  name: string;
  monthlyVolume: number;
  avgHandleTimeMinutes: number;
  repeatabilityScore: number;
  standardizationScore: number;
  approvalComplexityScore: number;
  reworkRateScore: number;
  slaRiskScore: number;
  customerImpactScore: number;
  implementationDifficultyScore: number;
  suggestedAutomationType: string;
  summary: string;
  suggestedApproach: string;
  implementationConsiderations: string;
  riskNotes: string;
  recommendedNextStep: string;
};

type AiIntakeProps = {
  onAnalysis: (data: AnalysisData) => void;
};

export function AiIntake({ onAnalysis }: AiIntakeProps) {
  const { isConfigured, activeKey, provider } = useApiKeys();
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAnalyze() {
    if (!description.trim() || !isConfigured) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/ai/analyze-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": activeKey,
          "x-ai-provider": provider,
        },
        body: JSON.stringify({ description: description.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Analysis failed");
      }

      const data = await response.json();
      setStatus("idle");
      onAnalysis(data.analysis);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to analyze process",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Process description
        </label>
        <textarea
          className="min-h-[140px] w-full rounded-2xl border border-line bg-background px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
          placeholder="Describe a recurring operational process... (e.g., 'Every month our service desk gets ~200 password reset tickets, each takes 8 minutes...')"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={status === "loading"}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={handleAnalyze}
            disabled={!isConfigured || !description.trim() || status === "loading"}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing process...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze with AI
              </>
            )}
          </button>
          {!isConfigured && (
            <p className="mt-2 text-xs text-muted-foreground">
              Configure an API key in AI Settings to use this feature.
            </p>
          )}
        </div>
      </div>

      {status === "error" && errorMessage && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
