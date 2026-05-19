/**
 * Public API for the auctions feature.
 *
 * Only export what other features and pages need to import.
 * Internal implementation details stay hidden behind this barrel.
 */

// Components
export { AuctionsPage } from "./components/auctions-page";
export { AuctionDetailPage } from "./components/auction-detail";
export { AuctionCard, AuctionCardSkeleton, CountdownTimer } from "./components/auction-card";
export { AuctionFilterBar } from "./components/auction-filter-bar";
export { ClosingSoonSection, HomeHero } from "./components/Home-Sections";
export { CreateAuctionPage } from "./components/create-auction/CreateAuctionPage";
export { EditAuctionPage } from "./components/edit-auction/EditAuctionPage";
export { SellerDashboardPage } from "./components/seller-dashboard/SellerDashboardPage";

// TanStack Query hooks
export {
  auctionKeys,
  useGetAuctions,
  useGetAuctionById,
  useGetBidHistory,
  useGetAuctionsByCategory,
  useGetClosingSoonAuctions,
  useGetSellerAuctions,
} from "./api";

// Mutations
export { useCreateAuction, useUpdateAuction, useDeleteAuction } from "./api";

// Async fetch functions (for prefetching or non-hook usage)
export {
  fetchActiveAuctions,
  fetchAuctionById,
  fetchAuctionsByCategory,
  fetchClosingSoonAuctions,
} from "./api";

// Types
export type {
  Auction,
  AuctionSummary,
  BidHistoryEntry,
  Seller,
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

// Validations
export { createAuctionSchema } from "./validations/auction.schema";
export type { CreateAuctionFormValues } from "./validations/auction.schema";
