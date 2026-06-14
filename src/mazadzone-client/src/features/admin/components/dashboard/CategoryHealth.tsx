"use client";

import React from "react";
import { Info, ArrowUpRight, TrendingUp } from "lucide-react";
import type { CategoryHealthStats } from "../../types/admin.types";

import { CategoryHealthSkeleton } from "./skeletons";

interface CategoryHealthProps {
  data?: CategoryHealthStats;
  isLoading?: boolean;
}

export function CategoryHealth({ data, isLoading }: CategoryHealthProps) {
  if (isLoading || !data) {
    return <CategoryHealthSkeleton />;
  }

  // Find highest count to determine proportional widths (scale of 100%)
  const maxCount = Math.max(...data.categories.map((c) => c.liveAuctionsCount), 1);

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-5 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-bold text-foreground">
            Category Health <span className="text-xs text-muted-foreground font-normal">(Top by Live Auctions)</span>
          </h3>
          <span title="Distribution of ongoing live auctions per category">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </span>
        </div>

        <a href="/admin/categories" className="text-xs font-semibold text-primary hover:underline transition-colors">
          View All
        </a>
      </div>

      {/* Content layout split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center flex-1">
        {/* Left: Category list with proportional progress bars */}
        <div className="md:col-span-2 space-y-4">
          {data.categories.map((category) => {
            const pct = (category.liveAuctionsCount / maxCount) * 100;
            return (
              <div key={category.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{category.name}</span>
                  <span className="font-mono font-medium text-foreground">
                    {category.liveAuctionsCount}
                  </span>
                </div>
                {/* Horizontal custom bar */}
                <div className="h-2 w-full bg-muted/40 rounded-full">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Total live auctions box */}
        <div className="bg-background/40 border border-border rounded-xl p-5 flex flex-col justify-between items-center text-center h-full min-h-[160px]">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
            <TrendingUp className="h-5 w-5" />
          </div>

          <div className="flex flex-col mt-2">
            <span className="text-2xl font-extrabold text-foreground font-mono">
              {data.totalLiveAuctions.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
              Total Live Auctions
            </span>
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center gap-1 mt-3 text-[10px] font-semibold text-success-foreground px-2 py-0.5 bg-success/20 rounded-md">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{data.totalLiveAuctionsChangePercent}% vs last 30d</span>
          </div>
        </div>
      </div>
    </div>
  );
}
