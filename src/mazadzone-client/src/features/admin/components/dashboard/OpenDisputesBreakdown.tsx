"use client";

import React from "react";
import { Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OpenDisputesBreakdown } from "../../types/admin.types";

import { OpenDisputesBreakdownSkeleton } from "./skeletons";

interface OpenDisputesBreakdownProps {
  data?: OpenDisputesBreakdown;
  isLoading?: boolean;
}

// Color palette indexed by position — top 5+ items each get a distinct color
const QUEUE_COLOR_PALETTE = [
  "#f59e0b", // Amber
  "#c84e02", // Dark Orange
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

const chartConfig: ChartConfig = {
  count: {
    label: "Cases",
  },
};

export function OpenDisputesBreakdown({ data, isLoading }: OpenDisputesBreakdownProps) {
  if (isLoading || !data) {
    return <OpenDisputesBreakdownSkeleton />;
  }
  // Convert queues into recharts format with index-based colors
  const chartData = data.queues.map((item, index) => ({
    name: item.name,
    value: item.count,
    color: QUEUE_COLOR_PALETTE[index % QUEUE_COLOR_PALETTE.length],
  }));

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-5 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-bold text-foreground">Open Disputes Breakdown</h3>
          <span title="Breakdown of currently unresolved transaction disputes">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </span>
        </div>
      </div>

      {/* Donut and Queue list side-by-side or stacked depending on space */}
      <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center justify-between gap-6 flex-1 py-2">
        {/* Left: Donut Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <ChartContainer config={chartConfig} className="w-full h-full aspect-square">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Centered label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-foreground tracking-tight leading-none">
              {data.totalItems}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground mt-1">
              Open Cases
            </span>
          </div>
        </div>

        {/* Right: Queue List */}
        <div className="flex-1 w-full space-y-3.5">
          {/* Header Labels */}
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border">
            <span>Dispute Type</span>
            <div className="flex items-center gap-4 sm:gap-8 xl:gap-4 2xl:gap-8">
              <span>Cases</span>
              <span className="w-20 text-right">vs prev 30d</span>
            </div>
          </div>

          {/* List items */}
          <div className="space-y-3">
            {data.queues.map((item, index) => {
              const dotColor = QUEUE_COLOR_PALETTE[index % QUEUE_COLOR_PALETTE.length];
              return (
                <div key={item.key} className="flex justify-between items-center text-xs">
                  {/* Dot + Label */}
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="font-medium text-foreground">{item.name}</span>
                  </div>

                  {/* Count & Percent */}
                  <div className="flex items-center gap-4 sm:gap-8 xl:gap-4 2xl:gap-8 font-mono font-medium">
                    <span className="text-foreground tabular-nums">{item.count}</span>
                    <span
                      className={cn(
                        "w-20 text-right flex items-center justify-end font-semibold tabular-nums",
                        item.isPositive
                          ? "text-success-foreground"
                          : "text-destructive"
                      )}
                    >
                      {item.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      )}
                      {Math.abs(item.changePercent)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review CTA panel */}
      <div className="mt-4 p-3 bg-accent/40 rounded-lg flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-start sm:items-center xl:items-start 2xl:items-center justify-between gap-3 border border-accent">
        <div className="flex items-start gap-2.5">
          <span className="text-sm shrink-0 mt-0.5">🛡️</span>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Resolve user conflicts efficiently to maintain trust and support marketplace safety.
          </p>
        </div>
        <Button className="w-full sm:w-auto xl:w-full 2xl:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8 rounded-md shrink-0 shadow-xs">
          Go to Dispute Center
        </Button>
      </div>
    </div>
  );
}
