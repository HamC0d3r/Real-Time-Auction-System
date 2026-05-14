"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { AuctionCard } from "./AuctionCard";
import { AuctionCardSkeleton } from "@/features/auctions/components/AuctionCardSkeleton";
import { AuctionFilterBar } from "./auction-filter-bar";
import { useGetAuctions } from "../api";
import { AuctionFilters } from "../types/auction.types";

/**
 * Auctions page-level component.
 *
 * This is the main entry point rendered by `app/(main)/auctions/page.tsx`.
 * It owns the page layout, data fetching orchestration, and feature composition.
 *
 * Uses TanStack Query (`useGetAuctions`) for server state management.
 * The query is backed by mock data during development and will seamlessly
 * switch to real API calls when the backend is ready.
 */
export function AuctionsPage() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<AuctionFilters>(() => {
    const f: any = {};
    searchParams.forEach((value, key) => {
      if (value) {
        const num = Number(value);
        // Convert to number if numeric and not the 'search' field
        if (!isNaN(num) && value.trim() !== "" && key !== "search") {
          f[key] = num;
        } else {
          f[key] = value;
        }
      }
    });
    return f as AuctionFilters;
  }, [searchParams]);

  const { data: auctions, isLoading, isError, refetch } = useGetAuctions(filters);

  const handleFilterChange = useCallback((newFilters: AuctionFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleFavoriteClick = useCallback((auctionId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(auctionId)) {
        next.delete(auctionId);
      } else {
        next.add(auctionId);
      }
      return next;
    });
  }, []);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auctions</h1>
          <p className="text-muted-foreground">
            Browse live and upcoming auctions
          </p>
        </div>

        {/* Filter bar */}
        <AuctionFilterBar
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
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

        {/* Empty state */}
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

        {/* Success state */}
        {!isLoading && !isError && auctions && auctions.length > 0 && (
          <>
            {/* Auction count */}
            <p className="text-sm text-muted-foreground">
              Showing {auctions.length} {filters.status?.toLowerCase() || "active"} auctions
            </p>

            {/* Auction grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {auctions.map((auction, index) => (
                <AuctionCard
                  key={auction.id}
                  auction={{
                    ...auction,
                    isFavorite: favorites.has(auction.id),
                  }}
                  onFavoriteClick={handleFavoriteClick}
                  priority={index < 4}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
