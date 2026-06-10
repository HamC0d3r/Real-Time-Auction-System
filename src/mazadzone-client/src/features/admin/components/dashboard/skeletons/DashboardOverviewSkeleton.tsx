import React from "react";
import { ActivityChartSkeleton } from "./ActivityChartSkeleton";
import { OpenDisputesBreakdownSkeleton } from "./OpenDisputesBreakdownSkeleton";
import { UserGrowthChartSkeleton } from "./UserGrowthChartSkeleton";
import { UserTrustSkeleton } from "./UserTrustSkeleton";
import { CategoryHealthSkeleton } from "./CategoryHealthSkeleton";
import { SubcategoryHealthSkeleton } from "./SubcategoryHealthSkeleton";

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 1. Metric Strip Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border border-border rounded-xl bg-card overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-center px-5 py-4 border-r border-b border-border last:border-r-0"
          >
            <div className="h-3 bg-muted rounded w-20 mb-2" />
            <div className="h-5 bg-muted rounded w-14" />
            <div className="h-2.5 bg-muted rounded w-16 mt-2" />
          </div>
        ))}
      </div>

      {/* 2. Charts Row 1: Activity Chart (2/3) & Donut Disputes (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
        <div className="xl:col-span-2">
          <ActivityChartSkeleton />
        </div>
        <div className="xl:col-span-1">
          <OpenDisputesBreakdownSkeleton />
        </div>
      </div>

      {/* 3. Charts Row 2: User Growth (2/3) & User Trust (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">
        <div className="xl:col-span-2">
          <UserGrowthChartSkeleton />
        </div>
        <div className="xl:col-span-1">
          <UserTrustSkeleton />
        </div>
      </div>

      {/* 4. Row 3: Category Health (1/2) & Subcategory Health (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <CategoryHealthSkeleton />
        <SubcategoryHealthSkeleton />
      </div>
    </div>
  );
}
