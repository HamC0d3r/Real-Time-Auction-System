/**
 * Auction-specific TypeScript types and enums.
 */
import type { AuthUser } from "@/stores/auth.store";
import {
  AUCTION_STATUS,
  AUCTION_CATEGORY,
  AUCTION_SUBCATEGORY,
  AUCTION_CONDITION,
  AUCTION_SORT_BY,
} from "@/types/domain.constants";
import type {
  AuctionStatus as AuctionStatusType,
  AuctionCategory as AuctionCategoryType,
  AuctionSubcategory as AuctionSubcategoryType,
  AuctionCondition as AuctionConditionType,
  AuctionSortBy as AuctionSortByType,
} from "@/types/domain.constants";

// --- Enums (shared domain constants) -----------------------------

export const AuctionStatus = AUCTION_STATUS;
export const AuctionCategory = AUCTION_CATEGORY;
export const AuctionSubcategory = AUCTION_SUBCATEGORY;
export const AuctionCondition = AUCTION_CONDITION;
export const AuctionSortBy = AUCTION_SORT_BY;

export type AuctionStatus = AuctionStatusType;
export type AuctionCategory = AuctionCategoryType;
export type AuctionSubcategory = AuctionSubcategoryType;
export type AuctionCondition = AuctionConditionType;
export type AuctionSortBy = AuctionSortByType;

// --- Domain Models -----------------------------------------------

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: AuctionCategory;
  subcategory: AuctionSubcategory;
  status: AuctionStatus;
  images: string[];
  startingPrice: number;
  currentBid: number | null;
  bidCount: number;
  startDate: Date;
  endDate: Date;

  seller: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };

  creationDate: string;
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
  subcategory: AuctionSubcategory;
  condition: AuctionCondition;
  status: AuctionStatus;
  description: string;
  conditionDescription?: string;

  pricing: {
    startingPrice: number;
    currentBid: number | null;
    bidCount: number;
    minimumIncrement?: number;
  };

  timing: {
    startDate: Date;
    endDate: Date;
    creationDate: string;
  };

  isFavorite: boolean;
  isOwner: boolean;

  /** Gallery images — primary image is always first. Between 1 and 20 items. */
  images: string[];
  /** Pre-loaded bid history for this auction. Empty array if no bids yet. */
  bidHistory: BidHistoryEntry[];
  seller?: Seller;
}

export interface BidHistoryEntry {
  id: string;
  bidderName: string;
  bidderInitial: string;
  amount: number;
  timeAgo: string;
  isHighest: boolean;
  bidderId?: string;
}

export interface Seller extends AuthUser {
  isVerified: boolean;
  avatarInitial: string;
  reviews: number;
  rating: number;
}


// --- Component Props ---------------------------------------------

export interface AuctionCardProps {
  auction: AuctionSummary;
  priority?: boolean;
  className?: string;
  actionSlot?: React.ReactNode;
}

// --- Input Types -------------------------------------------------

export interface CreateAuctionInput {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  condition: AuctionCondition;
  conditionDescription?: string;
  startingPrice: number;
  minimumIncrement: number;
  shippingLocation: string;
  startDate: string;
  endDate: string;
  images: (File | string)[];
}

export interface UpdateAuctionInput {
  title?: string;
  description?: string;
  category?: AuctionCategory;
  subcategory?: AuctionSubcategory;
  condition?: AuctionCondition;
  conditionDescription?: string;
  startingPrice?: number;
  minimumIncrement?: number;
  shippingLocation?: string;
  startDate?: string;
  endDate?: string;
  images?: (string | File)[];
}

// --- Filter Types ------------------------------------------------

export interface AuctionFilters {
  search?: string;
  category?: AuctionCategory;
  subcategory?: AuctionSubcategory;
  condition?: AuctionCondition;
  status?: AuctionStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: AuctionSortBy;
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// --- Response Types ----------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
