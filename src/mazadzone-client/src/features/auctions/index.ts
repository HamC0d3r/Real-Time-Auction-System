/**
 * Public API for the auctions feature.
 *
 * Only export what other features and pages need to import.
 * Internal implementation details stay hidden behind this barrel.
 */

// Components
export { AuctionsPage } from "./components/auctions-page";
export { AuctionCard } from "./components/auction-card";
export { AuctionTimer } from "./components/auction-timer";

// API hooks
export { useGetAuctions, useGetAuctionById } from "./api";
export { useCreateAuction, useUpdateAuction } from "./api";

// Types
export type {
  Auction,
  AuctionSummary,
  AuctionFilters,
  CreateAuctionInput,
  UpdateAuctionInput,
} from "./types/auction.types";
export { AuctionStatus, AuctionCategory } from "./types/auction.types";

// Hooks
export { useAuctionCountdown } from "./hooks/use-auction-countdown";

// Utils
export {
  isAuctionBiddable,
  isAuctionEditable,
  getAuctionStatusLabel,
} from "./utils/auction.utils";
