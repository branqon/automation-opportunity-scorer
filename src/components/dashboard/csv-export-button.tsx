"use client";

import { Download } from "lucide-react";
import type { RankedOpportunity } from "@/lib/scoring";
import { formatHours } from "@/lib/formatters";

type CsvExportButtonProps = {
  opportunities: RankedOpportunity[];
};

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function CsvExportButton({ opportunities }: CsvExportButtonProps) {
  function handleExport() {
    const headers = [
      "Rank",
      "Name",
      "Team",
      "Score",
      "Effort Tier",
      "Value Band",
      "Monthly Hours Saved",
      "Annual Savings",
    ];

    const rows = opportunities.map((o) => [
      o.rank,
      escapeCsvField(o.name),
      escapeCsvField(o.team.name),
      o.score,
      escapeCsvField(o.effortTier),
      escapeCsvField(o.valueBand),
      formatHours(o.monthlyHoursSaved),
      `$${o.annualCostSavings.toLocaleString("en-US")}`,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);

    const link = document.createElement("a");
    link.href = url;
    link.download = `automation-opportunities-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 rounded-full border border-line/70 bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:border-accent hover:text-foreground"
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </button>
  );
}
