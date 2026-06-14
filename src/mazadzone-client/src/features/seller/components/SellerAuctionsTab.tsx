import { AuctionCard, AuctionPagination, AuctionActionSlot } from "@/features/auctions";
import type { AuctionSummary } from "@/features/auctions";

interface SellerAuctionsTabProps {
  auctions: AuctionSummary[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SellerAuctionsTab({
  auctions,
  currentPage,
  totalPages,
  onPageChange,
}: SellerAuctionsTabProps) {
  if (auctions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card py-16 text-center shadow-xs">
        <p className="text-muted-foreground text-sm font-medium">
          No auctions listed by this seller yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 3-column Grid Layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            auction={auction}
            actionSlot={
              <AuctionActionSlot
                auctionId={auction.id}
                status={auction.status}
                isOwner={auction.isOwner}
                alwaysViewDetails
              />
            }
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <AuctionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        hasPreviousPage={currentPage > 1}
        hasNextPage={currentPage < totalPages}
        className="mt-2 flex justify-center"
      />
    </div>
  );
}
