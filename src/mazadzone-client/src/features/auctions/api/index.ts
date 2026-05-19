// TanStack Query hooks
export {
  auctionKeys,
  useGetAuctions,
  useGetAuctionById,
  useGetAuctionsByCategory,
  useGetClosingSoonAuctions,
  useGetBidHistory,
  useGetSimilarAuctions,
  useGetSellerAuctions,
} from "./auction.queries";

// Mutations
export { useCreateAuction, useUpdateAuction, useDeleteAuction } from "./auction.mutations";

// Raw fetch functions (for non-hook usage or prefetching)
export {
  fetchActiveAuctions,
  fetchAuctionById,
  fetchAuctionsByCategory,
  fetchClosingSoonAuctions,
  createAuctionApi,
  updateAuctionApi,
  fetchSellerAuctions,
  deleteAuctionApi,
} from "./auctions.api";
