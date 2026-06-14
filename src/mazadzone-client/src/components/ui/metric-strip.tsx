import type { ElementType } from "react";
import { cn } from "@/lib/utils";

export interface MetricStripItem {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: ElementType;
  iconClassName?: string;
}

export interface MetricStripProps {
  items: MetricStripItem[];
  isLoading?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export function MetricStrip({
  items,
  isLoading = false,
  className,
  labelClassName,
  valueClassName,
}: MetricStripProps) {
  if (isLoading) {
    return <MetricStripSkeleton count={items.length || 6} className={className} />;
  }

  return (
    <div
      className={cn(
        "grid auto-rows-fr border border-border rounded-xl bg-card overflow-hidden",
        items.length <= 4
          ? "grid-cols-2 md:grid-cols-4"
          : items.length === 5
            ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
            : "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "flex flex-col justify-center px-3.5 sm:px-5 py-4 text-left relative",
              // Vertical dividers — right border on all except last in each visual row
              "border-r border-border last:border-r-0",
              // Bottom border for wrapped rows on mobile
              "border-b border-border",
              // Remove bottom border on last row
              items.length <= 4
                ? "[&:nth-last-child(-n+4)]:border-b-0 md:[&:nth-last-child(-n+4)]:border-b-0"
                : items.length === 5
                  ? "[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 xl:[&:nth-last-child(-n+5)]:border-b-0"
                  : "[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-last-child(-n+3)]:border-b-0 xl:[&:nth-last-child(-n+6)]:border-b-0",
              // Fix right border on row ends
              items.length <= 4
                ? "even:border-r-0 md:[&:nth-child(4n)]:border-r-0 md:even:border-r"
                : items.length === 5
                  ? "even:border-r-0 md:[&:nth-child(3n)]:border-r-0 md:even:border-r xl:[&:nth-child(3n)]:border-r xl:[&:nth-child(5n)]:border-r-0"
                  : "even:border-r-0 md:[&:nth-child(3n)]:border-r-0 md:even:border-r xl:[&:nth-child(3n)]:border-r xl:[&:nth-child(6n)]:border-r-0",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className={cn("text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate", labelClassName)}>
                  {item.label}
                </span>
                <span className={cn("text-lg sm:text-xl font-bold tracking-tight text-foreground", valueClassName)}>
                  {item.value}
                </span>
              </div>
              {Icon && (
                <div className="shrink-0">
                  <Icon
                    className={cn("h-4.5 w-4.5 text-muted-foreground/50", item.iconClassName)}
                  />
                </div>
              )}
            </div>
            {(item.subtext || item.trend) && (
              <div className="flex items-center gap-2 mt-1">
                {item.subtext && (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {item.subtext}
                  </span>
                )}
                {item.trend && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold",
                      item.trendDirection === "up" && "text-success-foreground",
                      item.trendDirection === "down" && "text-destructive",
                      item.trendDirection === "neutral" && "text-muted-foreground",
                    )}
                  >
                    {item.trend}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MetricStripSkeleton({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid auto-rows-fr border border-border rounded-xl bg-card overflow-hidden",
        count <= 4
          ? "grid-cols-2 md:grid-cols-4"
          : count === 5
            ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
            : "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-center px-3.5 sm:px-5 py-4 border-r border-b border-border last:border-r-0 animate-pulse"
        >
          <div className="h-3 bg-muted rounded w-20 mb-2" />
          <div className="h-5 bg-muted rounded w-14" />
          <div className="h-2.5 bg-muted rounded w-16 mt-2" />
        </div>
      ))}
    </div>
  );
}
