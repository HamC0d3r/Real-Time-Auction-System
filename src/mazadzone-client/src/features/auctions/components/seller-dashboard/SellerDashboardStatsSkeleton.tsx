import React from "react";

export function SellerDashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-sm h-24 w-full animate-pulse flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-7 bg-muted rounded w-12" />
          </div>
          <div className="h-10 w-10 bg-muted rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );
}
