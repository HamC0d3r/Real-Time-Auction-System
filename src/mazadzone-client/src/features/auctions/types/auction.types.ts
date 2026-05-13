/**
 * Auction-specific TypeScript types and enums.
 *
 * These types represent the domain model for the auction feature.
 * Keep them in sync with the backend DTOs.
 */

// --- Enums -------------------------------------------------------

export const AuctionStatus = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  ACTIVE: "Active",
  ENDED: "Ended",
  CANCELLED: "Cancelled",
} as const;

export type AuctionStatus = (typeof AuctionStatus)[keyof typeof AuctionStatus];

export const AuctionCategory = {
  TECH_ELECTRONICS: "Tech and Electronics",
  FASHION_STYLE: "Fashion and Style",
  HOME_LIVING: "Home and Living",
  COLLECTIBLES_ART: "Collectibles and Art",
  HOBBIES_LEISURE: "Hobbies and Leisure",
  MOTORS: "Motors",
} as const;

export type AuctionCategory =
  (typeof AuctionCategory)[keyof typeof AuctionCategory];

export const AuctionCondition = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
} as const;

export type AuctionCondition =
  (typeof AuctionCondition)[keyof typeof AuctionCondition];

export const AuctionSortBy = {
  ENDING_SOONEST: "ending_soonest",
  LOWEST_PRICE: "lowest_price",
  MOST_BIDS: "most_bids",
  NEWEST: "newest",
} as const;

export type AuctionSortBy =
  (typeof AuctionSortBy)[keyof typeof AuctionSortBy];

// --- Domain Models -----------------------------------------------

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: AuctionCategory;
  status: AuctionStatus;
  images: string[];
  startingPrice: number;
  currentBid: number | null;
  bidCount: number;
  startDate: string;
  endDate: string;

  seller: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };

  createdAt: string;
  updatedAt: string;
}

/**
 * Summary version of Auction used in list views and card rendering.
 * Uses nested objects for pricing and timing to keep the shape organized.
 * This is the shape returned by the API layer and consumed by listing pages.
 *
 * Excludes UI-only concerns (onFavoriteClick, priority, className).
 */
export interface AuctionSummary {
  id: string;
  title: string;
  imageUrl: string;
  category: AuctionCategory;
  condition: AuctionCondition;
  status: AuctionStatus;

  pricing: {
    startingPrice: number;
    currentBid: number | null;
    bidCount: number;
  };

  timing: {
    endDate: string;
    createdAt: string;
  };

  location: string;
  isFavorite: boolean;
  isOwner: boolean;
}

// --- Component Props ---------------------------------------------

export interface AuctionCardProps {
  auction: AuctionSummary;
  onFavoriteClick: (auctionId: string) => void;
  priority?: boolean;
  className?: string;
}

// --- Input Types -------------------------------------------------

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

// --- Filter Types ------------------------------------------------

export interface AuctionFilters {
  search?: string;
  category?: AuctionCategory;
  condition?: AuctionCondition;
  status?: AuctionStatus;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: AuctionSortBy;
}
