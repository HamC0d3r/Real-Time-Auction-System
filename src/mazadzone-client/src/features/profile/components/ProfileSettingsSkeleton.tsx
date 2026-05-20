"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSettingsSkeleton() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Page Title Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Account Information Panel Skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col gap-6">
          <Skeleton className="h-6 w-44" />
          <div className="flex items-center gap-5 my-2">
            <Skeleton className="size-20 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          <div className="flex gap-3 mt-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Address Book Skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col gap-6">
          <div className="flex justify-between items-center pb-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </PageWrapper>
  );
}
