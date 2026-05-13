"use client";

import { cn } from "@/lib/utils";

interface AuctionCardSkeletonProps {
  className?: string;
}

/**
 * Skeleton placeholder for an AuctionCard while data is loading.
 * Mirrors the exact layout/dimensions of the real AuctionCard.
 */
export function AuctionCardSkeleton({ className }: AuctionCardSkeletonProps) {
  return (
    <article
      className={cn(
        "flex min-h-[416px] w-full max-w-[311px] flex-col rounded-[12px] border border-border bg-card p-3",
        className,
      )}
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <div className="h-[200px] w-full animate-pulse rounded-[8px] bg-muted" />

      {/* Title placeholder */}
      <div className="mt-3 space-y-2">
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-3/5 animate-pulse rounded bg-muted" />
      </div>

      {/* Countdown placeholder */}
      <div className="mt-2 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 w-14 animate-pulse rounded bg-muted" />
        ))}
      </div>

      {/* Divider */}
      <div className="my-2.5 h-px w-full bg-border" />

      {/* Price and bid count placeholder */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Button placeholder */}
      <div className="mt-auto pt-3">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </article>
  );
}
