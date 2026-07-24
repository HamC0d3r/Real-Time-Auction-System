"use client";

import { useCallback, useMemo } from "react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { AuctionCard, AuctionCardSkeleton } from "./auction-card";
import { AuctionFilterBar } from "./auction-filter-bar";
import { AuctionPagination } from "./auction-pagination";
import { useGetAuctions } from "../api";
import { AuctionFilters, AuctionStatus } from "../types/auction.types";
import { PlaceBidButton } from "@/features/bidding";

/**
 * Auctions page-level component.
 *
 * This is the main entry point rendered by `app/(main)/auctions/page.tsx`.
 * It owns the page layout, data fetching orchestration, and feature composition.
 */
export function AuctionsPage() {
  const { searchParams, setFilters } = useUrlFilters<AuctionFilters>();

  const filters = useMemo<AuctionFilters>(() => {
    const f: Record<string, string | number> = {};
    searchParams.forEach((value, key) => {
      if (value) {
        const num = Number(value);
        if (!isNaN(num) && value.trim() !== "" && key !== "search") {
          f[key] = num;
        } else {
          f[key] = value;
        }
      }
    });
    if (!f.page) f.page = 1;
    if (!f.pageSize) f.pageSize = 12;
    if (!f.status) f.status = AuctionStatus.ACTIVE;
    return f as AuctionFilters;
  }, [searchParams]);

  const { data: response, isLoading, isError, refetch } = useGetAuctions(filters);
  const auctions = response?.items;
  const pagination = response;

  const handleFilterChange = useCallback((newFilters: AuctionFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    setFilters({ page } as Partial<AuctionFilters>);
  }, [setFilters]);

  // Stable action slot references so React.memo on AuctionCard can work
  const actionSlots = useMemo(() => {
    if (!auctions) return new Map<string, React.ReactNode>();
    const map = new Map<string, React.ReactNode>();
    for (const auction of auctions) {
      map.set(auction.id, (
        <PlaceBidButton
          auctionId={auction.id}
          isOwner={auction.isOwner}
          status={auction.status}
        />
      ));
    }
    return map;
  }, [auctions]);

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auctions</h1>
          <p className="text-muted-foreground">
            Browse live and upcoming auctions
          </p>
        </div>

        <AuctionFilterBar
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-destructive">
              Failed to load auctions
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !isError && auctions?.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              No auctions found
            </p>
            <p className="text-sm text-muted-foreground">
              Check back later for new listings
            </p>
          </div>
        )}

        {!isLoading && !isError && auctions && auctions.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              Showing {auctions.length} {filters.status?.toLowerCase() || "active"} auctions
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {auctions.map((auction, index) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  priority={index < 4}
                  actionSlot={actionSlots.get(auction.id)}
                />
              ))}
            </div>

            {pagination && (
              <AuctionPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasPreviousPage={pagination.hasPreviousPage}
                hasNextPage={pagination.hasNextPage}
                className="mt-12 mb-8"
              />
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
