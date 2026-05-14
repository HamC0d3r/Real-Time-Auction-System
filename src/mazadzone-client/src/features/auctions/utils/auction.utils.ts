import { AuctionStatus } from "../types/auction.types";

/**
 * Pure utility functions for the auctions feature.
 */

/**
 * Determines if an auction can receive bids based on its status.
 */
export function isAuctionBiddable(status: AuctionStatus): boolean {
  return status === AuctionStatus.ACTIVE;
}

/**
 * Determines if an auction can be edited by its seller.
 */
export function isAuctionEditable(status: AuctionStatus): boolean {
  return status === AuctionStatus.UPCOMING;
}

/**
 * Returns a human-readable label for an auction status.
 */
export function getAuctionStatusLabel(status: AuctionStatus): string {
  const labels: Record<AuctionStatus, string> = {
    [AuctionStatus.UPCOMING]: "Upcoming",
    [AuctionStatus.ACTIVE]: "Live",
    [AuctionStatus.ENDED]: "Ended",
  };
  return labels[status];
}
