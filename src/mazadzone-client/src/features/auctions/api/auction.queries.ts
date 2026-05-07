import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PaginatedResult, PaginationParams } from "@/types/api.types";
import type { Auction, AuctionSummary, AuctionFilters } from "../types/auction.types";

// ─── Query Keys ──────────────────────────────────────────────────

/**
 * Centralized query key factory for the auctions feature.
 * Ensures consistent cache key structures across all auction queries.
 */
export const auctionKeys = {
  all: ["auctions"] as const,
  lists: () => [...auctionKeys.all, "list"] as const,
  list: (params: PaginationParams & AuctionFilters) =>
    [...auctionKeys.lists(), params] as const,
  details: () => [...auctionKeys.all, "detail"] as const,
  detail: (id: string) => [...auctionKeys.details(), id] as const,
};

// ─── Query Hooks ─────────────────────────────────────────────────

/**
 * Fetches a paginated list of auctions with optional filters.
 */
export function useGetAuctions(params: PaginationParams & AuctionFilters) {
  return useQuery({
    queryKey: auctionKeys.list(params),
    queryFn: () =>
      api.get<PaginatedResult<AuctionSummary>>("/auctions", { ...params }),
  });
}

/**
 * Fetches a single auction by its ID.
 */
export function useGetAuctionById(id: string) {
  return useQuery({
    queryKey: auctionKeys.detail(id),
    queryFn: () => api.get<Auction>(`/auctions/${id}`),
    enabled: !!id,
  });
}
