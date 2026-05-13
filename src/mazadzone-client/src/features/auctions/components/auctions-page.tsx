"use client";

import { useState, useCallback } from "react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { AuctionCard } from "./AuctionCard";
import { AuctionCardSkeleton } from "@/features/auctions/components/AuctionCardSkeleton";
import { useGetAuctions } from "../api";

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

  const { data: auctions, isLoading, isError, refetch } = useGetAuctions();

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

        {/* TODO: Filter bar */}

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
              Showing {auctions.length} active auctions
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
