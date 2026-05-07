"use client";

import { PageWrapper } from "@/components/layout/page-wrapper";
import { EmptyState } from "@/components/status/empty-state";

/**
 * Auctions page-level component.
 *
 * This is the main entry point rendered by `app/(main)/auctions/page.tsx`.
 * It owns the page layout, data fetching orchestration, and feature composition.
 *
 * TODO: Wire up useGetAuctions, filters, and AuctionCard grid.
 */
export function AuctionsPage() {
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
        {/* TODO: Auction grid */}

        {/* Placeholder until auction list is wired up */}
        <EmptyState
          title="No auctions yet"
          description="Auctions will appear here once the feature is fully wired up."
        />
      </div>
    </PageWrapper>
  );
}
