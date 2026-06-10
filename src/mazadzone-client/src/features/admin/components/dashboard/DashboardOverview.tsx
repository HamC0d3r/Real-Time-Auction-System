"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { MetricStrip, type MetricStripItem } from "@/components/ui/metric-strip";
import { UserTrust } from "./UserTrust";
import { CategoryHealth } from "./CategoryHealth";
import { SubcategoryHealth } from "./SubcategoryHealth";
import { useGetAuctionActivityTrend, useGetUserGrowthTrend } from "../../api";
import { formatCurrency } from "@/utils/currency.utils";
import { METRIC_CARD_DEFINITIONS } from "../../constants/dashboard.constants";
import {
  ActivityChartSkeleton,
  OpenDisputesBreakdownSkeleton,
  UserGrowthChartSkeleton,
} from "./skeletons";
import type { AdminDashboardOverviewData } from "../../types/admin.types";

const ActivityChart = dynamic(
  () => import("./ActivityChart").then((module) => module.ActivityChart),
  { loading: () => <ActivityChartSkeleton /> },
);

const OpenDisputesBreakdown = dynamic(
  () =>
    import("./OpenDisputesBreakdown").then(
      (module) => module.OpenDisputesBreakdown,
    ),
  { loading: () => <OpenDisputesBreakdownSkeleton /> },
);

const UserGrowthChart = dynamic(
  () => import("./UserGrowthChart").then((module) => module.UserGrowthChart),
  { loading: () => <UserGrowthChartSkeleton /> },
);

interface DashboardOverviewProps {
  stats: AdminDashboardOverviewData;
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const [activityTimeframe, setActivityTimeframe] = useState("Week");
  const [growthTimeframe, setGrowthTimeframe] = useState("Week");

  const { data: activityData, isLoading: isActivityLoading } = useGetAuctionActivityTrend(activityTimeframe);
  const { data: growthData, isLoading: isGrowthLoading } = useGetUserGrowthTrend(growthTimeframe);
  
  // Helper to format currency values
  const formatCardValue = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return formatCurrency(num);
  };

  const metricItems: MetricStripItem[] = METRIC_CARD_DEFINITIONS.map((def) => {
    const metric = stats.metrics[def.metricKey];
    const value = def.isCurrency
      ? formatCardValue(metric.value)
      : (typeof metric.value === "number" ? metric.value.toLocaleString() : String(metric.value));

    return {
      label: def.title,
      value,
      trend: `${metric.isPositive ? "+" : ""}${metric.changePercent}%`,
      trendDirection: metric.isPositive ? "up" as const : "down" as const,
      subtext: "vs prev 30d",
      icon: def.icon,
      iconClassName: def.iconClassName,
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Metric Strip — replaces 6 individual cards */}
      <MetricStrip items={metricItems} />

      {/* 2. Charts Row 1: Composed Trend Chart (2/3) & Donut Disputes (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
        <div className="xl:col-span-2">
          <ActivityChart
            data={activityData || stats.auctionActivity}
            isLoading={isActivityLoading}
            timeframe={activityTimeframe}
            onTimeframeChange={setActivityTimeframe}
          />
        </div>
        <div className="xl:col-span-1">
          <OpenDisputesBreakdown data={stats.openDisputesBreakdown} />
        </div>
      </div>

      {/* 3. Charts Row 2: User Growth (2/3) & User Trust (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
        <div className="xl:col-span-2">
          <UserGrowthChart
            data={growthData || stats.userGrowth}
            isLoading={isGrowthLoading}
            timeframe={growthTimeframe}
            onTimeframeChange={setGrowthTimeframe}
          />
        </div>
        <div className="xl:col-span-1">
          <UserTrust data={stats.userTrust} />
        </div>
      </div>

      {/* 4. Row 3: Category Health (1/2) & Subcategory Health (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <CategoryHealth data={stats.categoryHealth} />
        <SubcategoryHealth data={stats.subcategoryHealth} />
      </div>
    </div>
  );
}
