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
export { EndingSoonSection, HomeHero, BrowseCategoriesSection, UpcomingAuctionsSection } from "./components/Home-Sections";
export { CreateAuctionPage } from "./components/create-auction/CreateAuctionPage";
export { EditAuctionPage } from "./components/edit-auction/EditAuctionPage";
export { AuctionPagination } from "./components/auction-pagination";
export { AuctionActionSlot } from "./components/AuctionActionSlot";

// TanStack Query hooks
export {
  auctionKeys,
  useGetAuctions,
  useGetAuctionById,
  useGetBidHistory,
  useGetAuctionsByCategory,
  useGetHomeAuctions,
  useGetSellerAuctions,
  useGetRootCategories,
  useGetCategoryTree,
} from "./api";

// Mutations
export { useCreateAuction, useUpdateAuction, useDeleteAuction } from "./api";

// Pure REST API methods (for prefetching or non-hook usage)
export {
  getAuctions,
  getAuctionById,
  getSimilarAuctions,
  createAuction,
  activateAuction,
  endAuction,
  cancelAuction,
} from "./api";

// Pure Mappers
export {
  mapAuctionsListDtoToSummary,
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
export { useRealtimeAuctions } from "./hooks/useRealtimeAuctions";

// Providers
export { CountdownProvider, useCountdownTick } from "./providers/CountdownProvider";

// Utils
export {
  isAuctionBiddable,
  isAuctionEditable,
  getAuctionStatusLabel,
} from "./utils/auction.utils";
export { getAuctionImageFallback, normalizeImageUrl } from "./utils/image.utils";

// Validations
export { createAuctionSchema } from "./validations/auction.schema";
export type { CreateAuctionFormValues } from "./validations/auction.schema";
