"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AutomationType } from "@/generated/prisma/enums";
import { AUTOMATION_TYPE_LABELS } from "@/lib/metadata";

const AUTOMATION_TYPE_OPTIONS = Object.entries(AUTOMATION_TYPE_LABELS) as [
  AutomationType,
  string,
][];

const SCORE_FIELDS = [
  {
    key: "repeatabilityScore" as const,
    label: "Repeatability",
    description: "1 = highly variable, 5 = nearly identical every time",
  },
  {
    key: "standardizationScore" as const,
    label: "Standardization",
    description: "1 = ad-hoc process, 5 = fully documented and standardized",
  },
  {
    key: "approvalComplexityScore" as const,
    label: "Approval complexity",
    description: "1 = no approvals needed, 5 = multiple approval layers",
  },
  {
    key: "reworkRateScore" as const,
    label: "Rework rate",
    description: "1 = rarely needs rework, 5 = frequently requires corrections",
  },
  {
    key: "slaRiskScore" as const,
    label: "SLA risk",
    description: "1 = no SLA pressure, 5 = regularly threatens SLA compliance",
  },
  {
    key: "customerImpactScore" as const,
    label: "Customer impact",
    description: "1 = internal only / low impact, 5 = directly affects customers",
  },
  {
    key: "implementationDifficultyScore" as const,
    label: "Implementation difficulty",
    description: "1 = simple to implement, 5 = requires significant engineering",
  },
];

type ScoreKey = (typeof SCORE_FIELDS)[number]["key"];

export type OpportunityFormData = {
  name: string;
  teamId: string;
  monthlyVolume: number | "";
  avgHandleTimeMinutes: number | "";
  repeatabilityScore: number;
  standardizationScore: number;
  approvalComplexityScore: number;
  reworkRateScore: number;
  slaRiskScore: number;
  customerImpactScore: number;
  implementationDifficultyScore: number;
  suggestedAutomationType: AutomationType | "";
  summary: string;
  suggestedApproach: string;
  implementationConsiderations: string;
  riskNotes: string;
  recommendedNextStep: string;
};

type Team = { id: string; slug: string; name: string };

type OpportunityFormProps = {
  teams: Team[];
  initialData?: Partial<OpportunityFormData>;
  source: "AI_ASSISTED" | "MANUAL";
};

function getInitialFormData(
  initialData?: Partial<OpportunityFormData>,
): OpportunityFormData {
  return {
    name: initialData?.name ?? "",
    teamId: initialData?.teamId ?? "",
    monthlyVolume: initialData?.monthlyVolume ?? "",
    avgHandleTimeMinutes: initialData?.avgHandleTimeMinutes ?? "",
    repeatabilityScore: initialData?.repeatabilityScore ?? 0,
    standardizationScore: initialData?.standardizationScore ?? 0,
    approvalComplexityScore: initialData?.approvalComplexityScore ?? 0,
    reworkRateScore: initialData?.reworkRateScore ?? 0,
    slaRiskScore: initialData?.slaRiskScore ?? 0,
    customerImpactScore: initialData?.customerImpactScore ?? 0,
    implementationDifficultyScore:
      initialData?.implementationDifficultyScore ?? 0,
    suggestedAutomationType: initialData?.suggestedAutomationType ?? "",
    summary: initialData?.summary ?? "",
    suggestedApproach: initialData?.suggestedApproach ?? "",
    implementationConsiderations:
      initialData?.implementationConsiderations ?? "",
    riskNotes: initialData?.riskNotes ?? "",
    recommendedNextStep: initialData?.recommendedNextStep ?? "",
  };
}

export function OpportunityForm({
  teams,
  initialData,
  source,
}: OpportunityFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<OpportunityFormData>(() =>
    getInitialFormData(initialData),
  );
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  function updateField<K extends keyof OpportunityFormData>(
    field: K,
    value: OpportunityFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const allScoresFilled = SCORE_FIELDS.every(
    (f) => formData[f.key] >= 1 && formData[f.key] <= 5,
  );

  const isValid =
    formData.name.trim() !== "" &&
    formData.teamId !== "" &&
    formData.monthlyVolume !== "" &&
    formData.avgHandleTimeMinutes !== "" &&
    allScoresFilled &&
    formData.suggestedAutomationType !== "" &&
    formData.summary.trim() !== "" &&
    formData.suggestedApproach.trim() !== "" &&
    formData.implementationConsiderations.trim() !== "" &&
    formData.riskNotes.trim() !== "" &&
    formData.recommendedNextStep.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to create opportunity");
      }

      const created = await response.json();
      router.push(`/opportunities/${created.slug}`);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create opportunity",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Basic information
        </h3>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Name
          <input
            type="text"
            className="min-h-11 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
            placeholder="Short descriptive name for the process"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Team
          <select
            className="min-h-11 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition focus:border-accent focus-visible:border-accent"
            value={formData.teamId}
            onChange={(e) => updateField("teamId", e.target.value)}
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Monthly volume
            <input
              type="number"
              min={1}
              className="min-h-11 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
              placeholder="e.g. 200"
              value={formData.monthlyVolume}
              onChange={(e) =>
                updateField(
                  "monthlyVolume",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Avg handle time (minutes)
            <input
              type="number"
              min={1}
              className="min-h-11 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
              placeholder="e.g. 8"
              value={formData.avgHandleTimeMinutes}
              onChange={(e) =>
                updateField(
                  "avgHandleTimeMinutes",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            />
          </label>
        </div>
      </div>

      <div className="border-t border-line/60" />

      {/* Scoring Factors */}
      <div className="space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Scoring factors
        </h3>

        <div className="space-y-4">
          {SCORE_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {field.label}
                </label>
                <span className="text-xs text-muted-foreground/70">
                  {field.description}
                </span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      updateField(field.key as ScoreKey, value)
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                      formData[field.key] === value
                        ? "bg-accent text-white"
                        : "bg-surface-subtle text-foreground hover:bg-surface-subtle/80"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line/60" />

      {/* Automation Details */}
      <div className="space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Automation details
        </h3>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Suggested automation type
          <select
            className="min-h-11 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-medium text-foreground outline-none ring-0 transition focus:border-accent focus-visible:border-accent"
            value={formData.suggestedAutomationType}
            onChange={(e) =>
              updateField(
                "suggestedAutomationType",
                e.target.value as AutomationType,
              )
            }
          >
            <option value="">Select an automation type</option>
            {AUTOMATION_TYPE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Summary
          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-line bg-background px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
            placeholder="2-3 sentence summary of the process and its automation potential"
            value={formData.summary}
            onChange={(e) => updateField("summary", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Suggested approach
          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-line bg-background px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
            placeholder="Recommended automation approach in 2-3 sentences"
            value={formData.suggestedApproach}
            onChange={(e) => updateField("suggestedApproach", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Implementation considerations
          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-line bg-background px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
            placeholder="Key technical or organizational considerations"
            value={formData.implementationConsiderations}
            onChange={(e) =>
              updateField("implementationConsiderations", e.target.value)
            }
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Risk notes
          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-line bg-background px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
            placeholder="Potential risks and challenges"
            value={formData.riskNotes}
            onChange={(e) => updateField("riskNotes", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Recommended next step
          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-line bg-background px-4 py-3 text-sm outline-none ring-0 transition placeholder:text-muted-foreground/50 focus:border-accent focus-visible:border-accent"
            placeholder="Concrete next action to move forward"
            value={formData.recommendedNextStep}
            onChange={(e) =>
              updateField("recommendedNextStep", e.target.value)
            }
          />
        </label>
      </div>

      {status === "error" && errorMessage && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={!isValid || status === "submitting"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create opportunity"
          )}
        </button>
      </div>
    </form>
  );
}
