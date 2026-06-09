"use client";

import { useEffect } from "react";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { useGetAuctionById } from "../../api";
import { AuctionDetailSkeleton } from "./AuctionDetailSkeleton";
import { AuctionDetailContent } from "./AuctionDetailContent";
import { AuctionStatus } from "../../types/auction.types";

interface AuctionDetailPageProps {
  id: string;
}

/**
 * Auction detail page-level component.
 *
 * Owns data fetching (via TanStack Query) and delegates rendering to
 * AuctionDetailContent. Handles loading, error, and empty states.
 *
 * Polling strategy for Upcoming → Active transition:
 * The backend activates auctions via a scheduled job (not a user action),
 * so it may not send a SignalR StatusChanged event. We poll every 5s once
 * the auction's start time has passed but the status is still "Upcoming",
 * so the UI transitions to Active within a few seconds automatically.
 */
export function AuctionDetailPage({ id }: AuctionDetailPageProps) {
  const { data: auction, isLoading, isError, refetch } = useGetAuctionById(id);

  // Poll when start time has passed but status is still Upcoming.
  // Stops automatically once the query returns a non-Upcoming status.
  const isPendingActivation =
    auction?.status === AuctionStatus.UPCOMING &&
    auction?.timing.startDate != null &&
    new Date() >= new Date(auction.timing.startDate);

  useEffect(() => {
    if (!isPendingActivation) return;
    const interval = setInterval(() => {
      void refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPendingActivation, refetch]);

  return (
    <PageWrapper>
      {/* Loading */}
      {isLoading && <AuctionDetailSkeleton />}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-lg font-medium text-destructive">
            Failed to load auction
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Not found */}
      {!isLoading && !isError && !auction && (
        <div className="flex flex-col items-center justify-center gap-2 py-24">
          <p className="text-lg font-medium text-muted-foreground">
            Auction not found
          </p>
          <p className="text-sm text-muted-foreground">
            This auction may have been removed or the link is invalid.
          </p>
        </div>
      )}

      {/* Success */}
      {!isLoading && !isError && auction && (
        <AuctionDetailContent auction={auction} />
      )}
    </PageWrapper>
  );
}
