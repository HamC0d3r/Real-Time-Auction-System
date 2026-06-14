// TanStack Query hooks
export {
  auctionKeys,
  useGetAuctions,
  useGetAuctionById,
  useGetAuctionsByCategory,
  useGetHomeAuctions,
  useGetBidHistory,
  useGetSimilarAuctions,
  useGetSellerAuctions,
  useGetRootCategories,
  useGetCategoryTree,
} from "./auction.queries";

// Mutations
export {
  useCreateAuction,
  useUpdateAuction,
  useDeleteAuction,
  useActivateAuction,
  useEndAuction,
  useCancelAuction,
} from "./auction.mutations";

// Pure REST API methods
export {
  getAuctions,
  getAuctionById,
  getSimilarAuctions,
  createAuction,
  activateAuction,
  endAuction,
  cancelAuction,
  getRootCategories,
  getCategoryTree,
} from "./auction.api";

// Pure Mappers
export {
  mapFiltersToQueryParams,
  mapAuctionsListDtoToSummary,
  mapAuctionDtoToSummary,
  mapCreateAuctionInputToRequest,
} from "./auction.mappers";
