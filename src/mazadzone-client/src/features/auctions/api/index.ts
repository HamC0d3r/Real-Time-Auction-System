// TanStack Query hooks
export {
  auctionKeys,
  useGetAuctions,
  useGetAuctionById,
  useGetAuctionsByCategory,
  useGetClosingSoonAuctions,
} from "./auction.queries";

// Mutations
export { useCreateAuction, useUpdateAuction } from "./auction.mutations";

// Raw fetch functions (for non-hook usage or prefetching)
export {
  fetchActiveAuctions,
  fetchAuctionById,
  fetchAuctionsByCategory,
  fetchClosingSoonAuctions,
} from "./auctions.api";
