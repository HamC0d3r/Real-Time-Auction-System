/**
 * Public API for the auctions feature.
 *
 * Only export what other features and pages need to import.
 * Internal implementation details stay hidden behind this barrel.
 */

// Components
export { AuctionsPage } from "./components/auctions-page";
export { AuctionCard } from "./components/AuctionCard";
export { AuctionCardSkeleton } from "./components/AuctionCardSkeleton";
export { CountdownTimer } from "./components/CountdownTimer";
export { AuctionFilterBar } from "./components/auction-filter-bar";

// TanStack Query hooks
export {
  auctionKeys,
  useGetAuctions,
  useGetAuctionById,
  useGetAuctionsByCategory,
} from "./api";

// Mutations
export { useCreateAuction, useUpdateAuction } from "./api";

// Async fetch functions (for prefetching or non-hook usage)
export {
  fetchActiveAuctions,
  fetchAuctionById,
  fetchAuctionsByCategory,
} from "./api";

// Types
export type {
  Auction,
  AuctionSummary,
  AuctionCardProps,
  AuctionFilters,
  CreateAuctionInput,
  UpdateAuctionInput,
} from "./types/auction.types";
export {
  AuctionStatus,
  AuctionCategory,
  AuctionCondition,
  AuctionSortBy,
} from "./types/auction.types";

// Hooks
export { useAuctionCountdown } from "./hooks/use-auction-countdown";

// Utils
export {
  isAuctionBiddable,
  isAuctionEditable,
  getAuctionStatusLabel,
} from "./utils/auction.utils";
