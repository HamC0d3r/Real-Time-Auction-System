/**
 * Auction-specific TypeScript types and enums.
 *
 * These types represent the domain model for the auction feature.
 * Keep them in sync with the backend DTOs.
 */

// ─── Enums ───────────────────────────────────────────────────────

export const AuctionStatus = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  ACTIVE: "Active",
  ENDED: "Ended",
  CANCELLED: "Cancelled",
} as const;

export type AuctionStatus = (typeof AuctionStatus)[keyof typeof AuctionStatus];

export const AuctionCategory = {
  ELECTRONICS: "Electronics",
  FASHION: "Fashion",
  HOME: "Home",
  VEHICLES: "Vehicles",
  COLLECTIBLES: "Collectibles",
  SPORTS: "Sports",
  OTHER: "Other",
} as const;

export type AuctionCategory =
  (typeof AuctionCategory)[keyof typeof AuctionCategory];

// ─── Domain Models ───────────────────────────────────────────────

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: AuctionCategory;
  status: AuctionStatus;
  images: string[];

  /** Starting price set by the seller */
  startingPrice: number;
  /** Current highest bid amount (null if no bids yet) */
  currentBid: number | null;
  /** Total number of bids placed */
  bidCount: number;

  /** ISO date string — when the auction opens for bidding */
  startDate: string;
  /** ISO date string — when the auction closes */
  endDate: string;

  seller: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };

  createdAt: string;
  updatedAt: string;
}

/** Summary version of Auction used in list views (fewer fields) */
export interface AuctionSummary {
  id: string;
  title: string;
  category: AuctionCategory;
  status: AuctionStatus;
  thumbnailUrl: string | null;
  startingPrice: number;
  currentBid: number | null;
  bidCount: number;
  endDate: string;
  sellerName: string;
}

// ─── Input Types ─────────────────────────────────────────────────

export interface CreateAuctionInput {
  title: string;
  description: string;
  category: AuctionCategory;
  startingPrice: number;
  startDate: string;
  endDate: string;
  images: File[];
}

export interface UpdateAuctionInput {
  title?: string;
  description?: string;
  category?: AuctionCategory;
  startDate?: string;
  endDate?: string;
}

// ─── Filter Types ────────────────────────────────────────────────

export interface AuctionFilters {
  search?: string;
  category?: AuctionCategory;
  status?: AuctionStatus;
  minPrice?: number;
  maxPrice?: number;
}
