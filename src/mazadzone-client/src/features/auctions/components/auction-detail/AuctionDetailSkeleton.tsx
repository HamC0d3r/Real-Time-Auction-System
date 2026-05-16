import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton that mirrors the AuctionDetailPage layout.
 */
export function AuctionDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_520px]">
      {/* Left Column: Image area & Description */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-row gap-3">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-[72px] rounded-lg" />
            ))}
          </div>
          {/* Main Image */}
          <Skeleton className="h-[639px] flex-1 rounded-xl" />
        </div>

        {/* Tabbed Content Skeleton */}
        <div className="space-y-6">
          <div className="flex border-b border-border mb-6">
            <Skeleton className="h-10 w-24 rounded-t" />
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-border p-6 space-y-4">
              <Skeleton className="h-5 w-1/4 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            </div>
            <div className="rounded-xl border border-border p-6 space-y-4">
              <Skeleton className="h-5 w-1/4 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Info area, Seller, & Bid History */}
      <div className="flex flex-col" style={{ gap: "26px" }}>
        {/* Title */}
        <Skeleton className="h-10 w-3/4 rounded-md" />

        {/* Countdown */}
        <Skeleton className="h-[72px] w-full rounded-xl" />

        {/* 3 stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>

        {/* Place Bid Button */}
        <Skeleton className="h-12 w-full rounded-[10px]" />

        {/* Seller info */}
        <div className="rounded-xl border border-border p-5 space-y-4">
          <Skeleton className="h-4 w-1/3 rounded" />
          <div className="flex items-center justify-start gap-12">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 pl-12 border-l border-border">
              <div className="flex flex-col items-center gap-1">
                <Skeleton className="h-6 w-14 rounded" />
                <Skeleton className="h-2 w-12 rounded" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <Skeleton className="h-6 w-14 rounded" />
                <Skeleton className="h-2 w-12 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Bid History Section Placeholder */}
        <div className="rounded-xl border border-border p-5 space-y-4">
          <Skeleton className="h-6 w-1/3 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
