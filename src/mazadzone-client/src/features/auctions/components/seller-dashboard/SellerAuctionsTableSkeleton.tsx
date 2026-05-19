import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const TABLE_HEADERS = [
  { key: "auction", label: "Auction", className: "" },
  { key: "status", label: "Status", className: "" },
  { key: "bids", label: "Bids", className: "" },
  { key: "lastBid", label: "Last Bid", className: "" },
  { key: "endDate", label: "End Date", className: "" },
  { key: "actions", label: "Actions", className: "text-right" },
] as const;

export function SellerAuctionsTableSkeleton() {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm space-y-6">
      {/* Table Controls / Filter & Sort Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
          <div className="h-6 bg-muted rounded w-36 animate-pulse" />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="w-[220px] rounded-full h-11 bg-muted animate-pulse" />
          <div className="w-[250px] rounded-full h-11 bg-muted animate-pulse" />
        </div>
      </div>

      {/* Main Table Skeleton */}
      <div className="overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border/80 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {TABLE_HEADERS.map((header) => (
                <th key={header.key} className={cn("px-6 py-4", header.className)}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="animate-pulse">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 bg-muted rounded-lg shrink-0" />
                    <div className="space-y-1.5 w-32">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  </div>
                </td>
                {/* Status, Bids, Last Bid, End Date, Actions skeletons */}
                {Array.from({ length: 5 }).map((_, colIdx) => (
                  <td key={colIdx} className={cn("px-6 py-5", colIdx === 4 && "text-right")}>
                    <div
                      className={cn(
                        "h-4 bg-muted rounded",
                        colIdx === 0 && "h-6 w-16",
                        colIdx === 1 && "w-8",
                        colIdx === 2 && "w-16",
                        colIdx === 3 && "w-24",
                        colIdx === 4 && "h-8 w-24 ml-auto"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
