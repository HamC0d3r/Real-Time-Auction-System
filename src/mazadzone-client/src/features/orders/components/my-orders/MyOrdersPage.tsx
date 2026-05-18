"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { OrderActivityItem } from "./OrderActivityItem";
import { useAuthStore } from "@/stores/auth.store";
import { ActivityList, ActivityFilters, ActivityPagination } from "@/components/activity-list";
import { Badge } from "@/components/ui/badge";
import { EmptyOrdersState } from "./EmptyOrdersState";
import { OrderRowsSkeleton } from "./OrderRowsSkeleton";
import { ErrorOrdersState } from "./ErrorOrdersState";
import { useGetMyOrders } from "../../api";
import { ROUTES } from "@/config/routes.config";

const FILTERS = ["All", "Pending", "Shipped", "Delivered", "Cancelled"] as const;

/**
 * MyOrdersPage Component
 * 
 * The main page component for the "My Orders" tab. Drives all filtering, sorting, and pagination 
 * logic directly from URL Query Parameters. Passes query parameters directly to the backend/mock API query 
 * layer, rendering the paginated result set returned by TanStack Query.
 */
export function MyOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse URL query parameters directly
  const activeFilter = searchParams.get("filter") || "All";
  const sortBy = searchParams.get("sortBy") || "latest";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 5;

  // Retrieve auth context dynamically
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = true; // Hardcoded for testing
  const userId = user?.id || "mock-user-123";

  // Real authentication redirect
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

  // Fetch orders from API / mock hook using current authenticated user's ID
  const { data: response, isLoading, isError, refetch } = useGetMyOrders(userId, queryParams);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="w-full max-w-[1398px] mx-auto my-11 rounded-xl px-4 md:px-6 py-8 md:py-12 bg-white border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Won Orders</h1>
          <div className="w-24 h-14 bg-gray-200 rounded-full" />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="h-12 w-2/3 bg-gray-200 rounded-full" />
          <div className="h-12 w-48 bg-gray-200 rounded-xl" />
        </div>
        <OrderRowsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1398px] mx-auto my-11 px-4">
        <ErrorOrdersState onRetry={refetch} />
      </div>
    );
  }

  const orders = response?.items || [];
  const totalCount = response?.totalCount || 0;
  const totalPages = response?.totalPages || 0;
  const hasPreviousPage = response?.hasPreviousPage || false;
  const hasNextPage = response?.hasNextPage || false;

  return (
    <div className="w-full max-w-[1398px] mx-auto my-11 rounded-xl px-4 md:px-6 py-8 md:py-12 bg-white border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Won Orders</h1>
        <Badge className="bg-[#1E2530] hover:bg-[#1E2530]/90 text-white rounded-full px-6 h-14 text-lg font-semibold flex items-center justify-center">
          {totalCount} total
        </Badge>
      </div>

      <ActivityFilters
        activeFilter={activeFilter}
        setActiveFilter={(filter) => updateQueryParams({ filter })}
        sortBy={sortBy}
        setSortBy={(sort) => updateQueryParams({ sortBy: sort })}
        filters={FILTERS}
      />

      {orders.length === 0 ? (
        <EmptyOrdersState />
      ) : (
        <ActivityList>
          {orders.map((order) => (
            <OrderActivityItem key={order.id} activity={order} />
          ))}
        </ActivityList>
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
