// import { AuctionDetailPage } from "@/features/auctions/components/auction-detail-page";

/**
 * Auction detail page — thin wrapper.
 * TODO: Import and render AuctionDetailPage from the auctions feature.
 */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // Note: In Next.js 15+, params is a Promise and must be awaited.
  // For now, this is a stub — the feature component will handle data fetching.
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <p className="text-muted-foreground">
        Auction detail page — TODO: wire up feature component
      </p>
    </div>
  );
}
