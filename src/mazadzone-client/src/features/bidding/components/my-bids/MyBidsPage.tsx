"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUrlFilters } from "@/hooks/use-url-filters";
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
  const { searchParams, setFilters } = useUrlFilters<{ filter: string, sortBy: string, page: number, pageSize: number }>();

  // Parse URL query parameters directly
  const activeFilter = (searchParams.get("filter") || "All") as FilterType;
  const sortBy = searchParams.get("sortBy") || "latest";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 5;

  // Retrieve auth context dynamically
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const userId = user?.id || "";

  // Client-side authentication redirect
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN || "/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  // Construct URL query parameters memoized to prevent infinite fetches
  const queryParams = useMemo(() => ({
    filter: activeFilter,
    sortBy,
    page,
    pageSize,
  }), [activeFilter, sortBy, page]);

  // Retrieve bidding activities via unified query API, enabled only for authenticated users
  const { data: response, isLoading, isError, refetch } = useGetMyBids(userId, queryParams);

  // Retrieve all bids (lightweight query with pageSize: 1) to determine if user has any bids in general
  const allBidsParams = useMemo(() => ({
    filter: "All" as const,
    page: 1,
    pageSize: 1,
  }), []);
  const { data: allBidsResponse } = useGetMyBids(userId, allBidsParams);

  const hasAnyBids = (allBidsResponse?.totalCount ?? 0) > 0;

  const emptyStateProps = useMemo(() => {
    if (!hasAnyBids) {
      return {};
    }

    switch (activeFilter) {
      case "Leading":
        return {
          title: "No Leading Bids",
          description: "You are not leading in any auctions right now. Check your active bids or place new ones to stay ahead!",
        };
      case "Outbid":
        return {
          title: "No Outbid Bids",
          description: "All your active bids are currently in the lead. Keep an eye on them so you don't miss out!",
        };
      case "Ended":
        return {
          title: "No Ended Bids",
          description: "You don't have any bids on completed auctions yet. Place bids on active auctions to win them!",
        };
      default:
        return {};
    }
  }, [hasAnyBids, activeFilter]);

  if (!isHydrated || !isAuthenticated) return null;

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
        setActiveFilter={(filter) => setFilters({ filter })}
        sortBy={sortBy}
        setSortBy={(sort) => setFilters({ sortBy: sort })}
        filters={FILTERS}
        sortPlaceholder="Sort by"
      />

      {/* Dynamic Data States */}
      {isLoading ? (
        <BidRowsSkeleton />
      ) : isError ? (
        <ErrorBidsState onRetry={refetch} />
      ) : bids.length === 0 ? (
        <EmptyBidsState {...emptyStateProps} />
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
            onPageChange={(targetPage) => setFilters({ page: targetPage })}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
          />
        </div>
      )}
    </div>
  );
}
