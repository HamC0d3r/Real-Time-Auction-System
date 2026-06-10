import { Skeleton } from "@/components/ui/skeleton";

export function SubcategoryHealthSkeleton() {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-5 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Content layout split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center flex-1">
        {/* Left: Subcategory list with proportional progress bars */}
        <div className="md:col-span-2 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-28 sm:w-36" />
                <Skeleton className="h-3.5 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Right: Total live auctions box */}
        <div className="bg-background/40 border border-border rounded-xl p-5 flex flex-col justify-between items-center text-center h-full min-h-[160px]">
          <Skeleton className="h-10 w-10 rounded-full mb-1" />

          <div className="flex flex-col items-center mt-2 gap-1.5">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>

          <Skeleton className="h-5 w-24 rounded-md mt-3" />
        </div>
      </div>
    </div>
  );
}
