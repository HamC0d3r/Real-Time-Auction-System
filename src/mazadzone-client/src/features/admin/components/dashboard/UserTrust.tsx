"use client";

import React from "react";
import { Info, ArrowUpRight, ShieldCheck, ChevronRight, UserPlus, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserTrustStats } from "../../types/admin.types";

import { UserTrustSkeleton } from "./skeletons";

interface UserTrustProps {
  data?: UserTrustStats;
  isLoading?: boolean;
}

// Icon mappings for the workflow funnel steps
const STEP_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: UserPlus,
  2: Store,
};

const PROGRESS_BAR_COLORS: Record<string, string> = {
  success: "bg-success-foreground",
  warning: "bg-primary",
  destructive: "bg-destructive",
};

export function UserTrust({ data, isLoading }: UserTrustProps) {
  if (isLoading || !data) {
    return <UserTrustSkeleton />;
  }
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-5 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-5">
        <h3 className="text-base font-bold text-foreground">User Trust</h3>
        <span title="Funnel mapping and account standing statistics">
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </span>
      </div>

      {/* 1. Funnel Steps Row - 2 Steps */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 items-center mb-5">
        {data.workflowSteps.map((stepItem, idx) => {
          const StepIcon = STEP_ICONS[stepItem.step] || UserPlus;
          return (
            <div key={stepItem.step} className="flex items-center w-full">
              <div className="flex-1 bg-background/50 border border-border rounded-lg p-3 flex items-center gap-3 relative">
                {/* Step badge */}
                <div className="absolute top-2 right-2 flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {stepItem.step}
                </div>
                {/* Icon */}
                <div className="h-10 w-10 rounded-md bg-accent/50 flex items-center justify-center text-primary shrink-0">
                  <StepIcon className="h-5 w-5" />
                </div>
                {/* Labels */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    {stepItem.name}
                  </span>
                  <span className="text-base font-extrabold text-foreground mt-0.5 font-mono">
                    {stepItem.count.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Connected Arrow (excluding last step) */}
              {idx < 1 && (
                <ChevronRight className="hidden xs:block h-5 w-5 text-muted-foreground mx-auto shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Stacked Lower Layout for Narrow Column */}
      <div className="flex flex-col gap-5 flex-1 justify-between">
        {/* Account Status Overview */}
        <div className="space-y-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Account Status Overview
          </span>

          <div className="space-y-3.5">
            {data.accountStatusOverview.map((item) => {
              const barColor = PROGRESS_BAR_COLORS[item.color] || "bg-muted";
              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    {/* Status name */}
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", barColor)} />
                      <span className="font-medium text-foreground">{item.status}</span>
                    </div>
                    {/* Metrics */}
                    <div className="flex items-center gap-4 font-mono text-muted-foreground font-medium">
                      <span className="text-foreground">{item.count.toLocaleString()}</span>
                      <span className="w-12 text-right">{item.percentage}%</span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", barColor)}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Score Box */}
        <div className="bg-background/40 border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center mt-2">
          <div className="h-10 w-10 rounded-full bg-success/20 text-success-foreground flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-foreground tracking-tight font-mono">
              {data.trustScore}%
            </span>
          </div>

          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">
            Trust Score
          </span>

          {/* Change percent */}
          <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-success-foreground px-2 py-0.5 bg-success-foreground/10 rounded-md">
            <ArrowUpRight className="h-3 w-3" />
            <span>+{data.trustScoreChangePercent}% vs prev 30d</span>
          </div>
        </div>
      </div>
    </div>
  );
}
