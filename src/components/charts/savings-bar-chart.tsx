"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { compactCurrencyFormatter, formatHours } from "@/lib/formatters";
import { useChartSize } from "@/components/charts/use-chart-size";

type SavingsDatum = {
  name: string;
  annualCostSavings: number;
  monthlyHoursSaved: number;
};

type SavingsBarChartProps = {
  data: SavingsDatum[];
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: SavingsDatum;
  }>;
};

const CHART_COLORS = {
  axis: "var(--chart-axis)",
  barEnd: "var(--chart-bar-end)",
  barStart: "var(--chart-bar-start)",
  cursorFill: "var(--chart-cursor-fill)",
  grid: "var(--chart-grid)",
} as const;

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const dataPoint = payload[0].payload;

  return (
    <div className="rounded-2xl border border-line/80 bg-surface px-4 py-3 shadow-card">
      <p className="font-semibold text-foreground">{dataPoint.name}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {compactCurrencyFormatter.format(dataPoint.annualCostSavings)} annual
        savings
      </p>
      <p className="text-sm text-muted-foreground">
        {formatHours(dataPoint.monthlyHoursSaved)} recovered per month
      </p>
    </div>
  );
}

export function SavingsBarChart({ data }: SavingsBarChartProps) {
  const { containerRef, size } = useChartSize();
  const isReady = size.width > 0 && size.height > 0;

  return (
    <div
      ref={containerRef}
      className="h-[320px] w-full min-w-0 rounded-3xl"
    >
      {isReady ? (
        <BarChart
          data={data}
          width={size.width}
          height={size.height}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
        >
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            axisLine={false}
            tickLine={false}
            dataKey="name"
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            interval={0}
            angle={-24}
            textAnchor="end"
            height={70}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
          />
          <Tooltip cursor={{ fill: CHART_COLORS.cursorFill }} content={<CustomTooltip />} />
          <Bar
            dataKey="annualCostSavings"
            fill="url(#savingsGradient)"
            radius={[14, 14, 0, 0]}
          />
          <defs>
            <linearGradient id="savingsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.barStart} />
              <stop offset="100%" stopColor={CHART_COLORS.barEnd} />
            </linearGradient>
          </defs>
        </BarChart>
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-3xl border border-line/70 bg-surface-subtle/40 text-sm text-muted-foreground">
          Loading savings view...
        </div>
      )}
    </div>
  );
}
