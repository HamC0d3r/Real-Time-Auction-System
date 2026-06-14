"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import { PlaceBidButton } from "@/features/bidding";
import { Button } from "@/components/ui/button";
import type { AuctionStatus } from "@/types/domain.constants";

interface AuctionActionSlotProps {
  auctionId: string;
  status: AuctionStatus;
  isOwner?: boolean;
  alwaysViewDetails?: boolean;
}

export function AuctionActionSlot({
  auctionId,
  status,
  isOwner = false,
  alwaysViewDetails = false,
}: AuctionActionSlotProps) {
  const router = useRouter();

  if (alwaysViewDetails || status !== "Active") {
    return (
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(ROUTES.AUCTIONS.DETAIL(auctionId));
        }}
        variant="outline"
        className="h-[48px] w-full cursor-pointer rounded-[10px] text-base font-bold tracking-wide transition-all active:scale-[0.98]"
        aria-label="View auction details"
      >
        <Eye className="mr-2 size-4" aria-hidden="true" />
        View Details
      </Button>
    );
  }

  return (
    <PlaceBidButton
      auctionId={auctionId}
      isOwner={isOwner}
      status={status}
    />
  );
}
