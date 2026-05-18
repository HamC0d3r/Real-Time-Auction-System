"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BidActivityItem } from "./BidActivityItem";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { useGetMyBids } from "../../api/bidding.queries";
import { ROUTES } from "@/config/routes.config";

// Subcomponents
import { ActivityFilters, ActivityPagination } from "@/components/activity-list";
import { BidRowsSkeleton } from "./BidRowsSkeleton";
import { EmptyBidsState } from "./EmptyBidsState";
import { ErrorBidsState } from "./ErrorBidsState";

const FILTERS = ["All", "Leading", "Outbid", "Ended"] as const;
type FilterType = typeof FILTERS[number];

/**
 * MyBidsPage Component
 * 
 * Drives all filtering, sorting, and pagination logic directly from URL Query Parameters.
 * Passes query criteria directly to the backend/mock API query layer, rendering the paginated
 * result set returned by TanStack Query.
 */
export function MyBidsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse URL query parameters directly
  const activeFilter = (searchParams.get("filter") || "All") as FilterType;
  const sortBy = searchParams.get("sortBy") || "latest";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 5;

  // Retrieve auth context dynamically
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = true; // Hardcoded for testing
  const userId = user?.id || "mock-user-123";

  // Client-side authentication redirect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN || "/login");
    }
  }, [isAuthenticated, router]);

  // Construct URL query parameters memoized to prevent infinite fetches
  const queryParams = useMemo(() => ({
    filter: activeFilter,
    sortBy,
    page,
    pageSize,
  }), [activeFilter, sortBy, page]);

  // Update query parameters in the URL
  const updateQueryParams = useCallback((newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filter or sort changes
    if (newParams.page === undefined) {
      params.set("page", "1");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // Retrieve bidding activities via unified query API, enabled only for authenticated users
  const { data: response, isLoading, isError, refetch } = useGetMyBids(userId, queryParams);

  if (!isAuthenticated) return null;

  const bids = response?.items || [];
  const totalCount = response?.totalCount || 0;
  const totalPages = response?.totalPages || 0;
  const hasPreviousPage = response?.hasPreviousPage || false;
  const hasNextPage = response?.hasNextPage || false;

  return (
    <div className="w-full max-w-[1398px] mx-auto my-11 rounded-xl px-4 md:px-6 py-8 md:py-12 bg-primary-foreground border border-gray-100 shadow-sm">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bids</h1>
        <Badge className="bg-[#1E2530] hover:bg-[#1E2530]/90 text-white rounded-full px-6 h-14 text-lg font-semibold flex items-center justify-center">
          {totalCount} total
        </Badge>
      </div>

      {/* Filters and Sort */}
      <ActivityFilters
        activeFilter={activeFilter}
        setActiveFilter={(filter) => updateQueryParams({ filter })}
        sortBy={sortBy}
        setSortBy={(sort) => updateQueryParams({ sortBy: sort })}
        filters={FILTERS}
        sortPlaceholder="Sort by"
      />

      {/* Dynamic Data States */}
      {isLoading ? (
        <BidRowsSkeleton />
      ) : isError ? (
        <ErrorBidsState onRetry={refetch} />
      ) : bids.length === 0 ? (
        <EmptyBidsState />
      ) : (
        <div className="flex flex-col gap-4">
          {bids.map((activity, index) => (
            <BidActivityItem key={`${activity.id}-${index}`} activity={activity} />
          ))}
        </div>
      )}

      {/* Reusable Pagination at bottom */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <ActivityPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(targetPage) => updateQueryParams({ page: targetPage })}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
          />
        </div>
      )}
    </div>
  );
}
