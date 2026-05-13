// TanStack Query hooks
export {
  auctionKeys,
  useGetAuctions,
  useGetAuctionById,
  useGetAuctionsByCategory,
  useGetAvailableLocations,
} from "./auction.queries";

// Mutations
export { useCreateAuction, useUpdateAuction } from "./auction.mutations";

// Raw fetch functions (for non-hook usage or prefetching)
export {
  fetchActiveAuctions,
  fetchAuctionById,
  fetchAuctionsByCategory,
  fetchAvailableLocations,
} from "./auctions.api";
