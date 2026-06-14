"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuctionImageGallery } from "./image-gallery";
import { AuctionMainInfo } from "./AuctionMainInfo";
import { SellerInfo } from "./SellerInfo";
import { BidHistory } from "./BidHistory";
import { ItemDetailsTab } from "./ItemDetailsTab";
import { SimilarItems } from "./SimilarItems";
import { ROUTES } from "@/config/routes.config";
import type { AuctionSummary, Seller } from "../../types/auction.types";

const PlaceBidModal = dynamic(
  () =>
    import("@/features/bidding/components/place-bid/PlaceBidModal").then(
      (module) => module.PlaceBidModal,
    ),
  { ssr: false },
);

interface AuctionDetailContentProps {
  auction: AuctionSummary;
}

/**
 * Orchestrator component for the Auction Detail view.
 * Responsible for state management and layout organization.
 */
export function AuctionDetailContent({
  auction,
}: AuctionDetailContentProps) {
  const router = useRouter();
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Mock Data & Derivatives
  // ---------------------------------------------------------------------------
  
  // Prefer the seller data from the API response, fallback to mock details if unavailable
  const seller: Seller = auction.seller || {
    id: "seller-123",
    fullName: "Ahmad Al-Rashid",
    email: "ahmad@mazadzone.com",
    role: "seller",
    isVerified: true,
    avatarInitial: "A",
    reviews: 277,
    rating: 4.6,
  };

  const fullDescription = auction.description || "";
  const conditionDescription = auction.conditionDescription || "No condition details provided.";

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handlePlaceBid = () => {
    if (auction.isOwner) {
      router.push(`${ROUTES.AUCTIONS.DETAIL(auction.id)}/edit`);
      return;
    }

    setIsBidModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_520px]">
        {/* --- Left Column: Images & Technical Details --- */}
        <div className="flex flex-col gap-6">
          <AuctionImageGallery images={auction.images} title={auction.title} />

          <ItemDetailsTab
            category={auction.category}
            subcategory={auction.subcategory}
            description={fullDescription}
            condition={auction.condition}
            conditionDescription={conditionDescription}
          />
        </div>

        {/* --- Right Column: Core Info & Bidding --- */}
        <div className="flex flex-col gap-5">
          <AuctionMainInfo
            auction={auction}
            onPlaceBid={handlePlaceBid}
          />

          <SellerInfo seller={seller} />

          <BidHistory
            bidHistory={auction.bidHistory}
            totalBids={auction.pricing.bidCount}
          />
        </div>
      </div>

      {/* --- Similar Items Section --- */}
      <SimilarItems 
        auctionId={auction.id}
        category={auction.category}
        subcategory={auction.subcategory}
      />

      {isBidModalOpen && (
        <PlaceBidModal
          auctionId={auction.id}
          auctionTitle={auction.title}
          currentBid={auction.pricing.currentBid ?? auction.pricing.startingPrice}
          minIncrement={auction.pricing.minimumIncrement ?? 10}
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
        />
      )}
    </>
  );
}
