"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { AiIntake } from "@/components/opportunities/ai-intake";
import {
  OpportunityForm,
  type OpportunityFormData,
} from "@/components/opportunities/opportunity-form";

type Tab = "ai" | "manual";

type Team = { id: string; slug: string; name: string };

type CreateOpportunityClientProps = {
  teams: Team[];
};

export function CreateOpportunityClient({
  teams,
}: CreateOpportunityClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("ai");
  const [aiData, setAiData] = useState<Partial<OpportunityFormData> | null>(
    null,
  );
  // Use a key to force re-mount the form when AI data arrives
  const [formKey, setFormKey] = useState(0);

  function handleAnalysis(data: Record<string, unknown>) {
    const mapped: Partial<OpportunityFormData> = {
      name: data.name as string,
      monthlyVolume: data.monthlyVolume as number,
      avgHandleTimeMinutes: data.avgHandleTimeMinutes as number,
      repeatabilityScore: data.repeatabilityScore as number,
      standardizationScore: data.standardizationScore as number,
      approvalComplexityScore: data.approvalComplexityScore as number,
      reworkRateScore: data.reworkRateScore as number,
      slaRiskScore: data.slaRiskScore as number,
      customerImpactScore: data.customerImpactScore as number,
      implementationDifficultyScore:
        data.implementationDifficultyScore as number,
      suggestedAutomationType: data.suggestedAutomationType as OpportunityFormData["suggestedAutomationType"],
      summary: data.summary as string,
      suggestedApproach: data.suggestedApproach as string,
      implementationConsiderations:
        data.implementationConsiderations as string,
      riskNotes: data.riskNotes as string,
      recommendedNextStep: data.recommendedNextStep as string,
    };
    setAiData(mapped);
    setFormKey((k) => k + 1);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "manual") {
      setAiData(null);
      setFormKey((k) => k + 1);
    }
  }

  const source = aiData ? "AI_ASSISTED" : "MANUAL";

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-strong"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
          Add an automation opportunity
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Describe a process manually or let AI extract the details for you.
        </p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => handleTabChange("ai")}>
          <Badge variant={activeTab === "ai" ? "accent" : "neutral"}>
            AI-Assisted
          </Badge>
        </button>
        <button type="button" onClick={() => handleTabChange("manual")}>
          <Badge variant={activeTab === "manual" ? "accent" : "neutral"}>
            Manual Entry
          </Badge>
        </button>
      </div>

      {activeTab === "ai" && (
        <SurfaceCard>
          <AiIntake onAnalysis={handleAnalysis} />
        </SurfaceCard>
      )}

      <SurfaceCard>
        <OpportunityForm
          key={formKey}
          teams={teams}
          initialData={aiData ?? undefined}
          source={source}
        />
      </SurfaceCard>
    </div>
  );
}
