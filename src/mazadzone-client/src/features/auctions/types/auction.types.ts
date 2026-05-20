/**
 * Auction-specific TypeScript types and enums.
 */
import type { AuthUser } from "@/stores/auth.store";

// --- Enums -------------------------------------------------------

export const AuctionStatus = {
  ACTIVE: "Active",
  UPCOMING: "Upcoming",
  ENDED: "Ended",
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

export const AuctionSubcategory = {
  // Tech
  LAPTOPS: "Laptops",
  SMARTPHONES: "Smartphones",
  CAMERAS: "Cameras",
  // Fashion
  WATCHES: "Watches",
  SHOES: "Shoes",
  ACCESSORIES: "Accessories",
  // Motors
  CARS: "Cars",
  MOTORCYCLES: "Motorcycles",
  // Home
  FURNITURE: "Furniture",
  DECOR: "Decor",
  // Collectibles & Art
  PAINTINGS: "Paintings",
  ANTIQUES: "Antiques",
  SCULPTURES: "Sculptures",
  // Hobbies & Leisure
  BOOKS: "Books",
  MUSICAL_INSTRUMENTS: "Musical Instruments",
  SPORTS_EQUIPMENT: "Sports Equipment",
  // Others
  OTHERS: "Others",
} as const;

export type AuctionSubcategory =
  (typeof AuctionSubcategory)[keyof typeof AuctionSubcategory];

export const AuctionCondition = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
} as const;

export type AuctionCondition =
  (typeof AuctionCondition)[keyof typeof AuctionCondition];

export const AuctionSortBy = {
  CREATION_DATE: "creationDate",
  PRICE: "Price",
  START_TIME: "StartTime",
  END_TIME: "EndTime",
} as const;

export type AuctionSortBy =
  (typeof AuctionSortBy)[keyof typeof AuctionSortBy];

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

  pricing: {
    startingPrice: number;
    currentBid: number | null;
    bidCount: number;
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
  onFavoriteClick: (auctionId: string) => void;
  priority?: boolean;
  className?: string;
}

// --- Input Types -------------------------------------------------

export interface CreateAuctionInput {
  title: string;
  description: string;
  category: AuctionCategory;
  subcategory: AuctionSubcategory;
  condition: AuctionCondition;
  conditionDescription?: string;
  startingPrice: number;
  minimumIncrement: number;
  shippingLocation: string;
  startDate: string;
  endDate: string;
  images: File[];
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
