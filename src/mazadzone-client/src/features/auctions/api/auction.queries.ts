import { useQuery } from "@tanstack/react-query";

import type {
  AuctionSummary,
  AuctionCategory,
  AuctionSubcategory,
  AuctionFilters,
  PaginatedResponse,
} from "../types/auction.types";

import {
  fetchActiveAuctions,
  fetchAuctionById,
  fetchAuctionsByCategory,
  fetchClosingSoonAuctions,
  fetchBidHistory,
  fetchSimilarAuctions,
  fetchSellerAuctions,
} from "./auctions.api";

// --- Query Keys --------------------------------------------------

/**
 * Centralized query key factory for the auctions feature.
 * Ensures consistent cache key structures across all auction queries.
 */
export const auctionKeys = {
  all: ["auctions"] as const,
  lists: () => [...auctionKeys.all, "list"] as const,
  list: (filters?: AuctionFilters) =>
    [...auctionKeys.lists(), filters ?? {}] as const,
  details: () => [...auctionKeys.all, "detail"] as const,
  detail: (id: string) => [...auctionKeys.details(), id] as const,
  category: (category: AuctionCategory) =>
    [...auctionKeys.all, "category", category] as const,
  bids: (id: string) => [...auctionKeys.detail(id), "bids"] as const,
  seller: (filters?: any) =>
    [...auctionKeys.all, "seller", filters ?? {}] as const,
};

// --- Query Hooks -------------------------------------------------

/**
 * Fetches active auctions with optional filters and sorting.
 *
 * Returns a paginated response.
 */
export function useGetAuctions(filters?: AuctionFilters) {
  return useQuery<PaginatedResponse<AuctionSummary>>({
    queryKey: auctionKeys.list(filters),
    queryFn: () => fetchActiveAuctions(filters),
  });
}

/**
 * Fetches a single auction by its ID.
 */
export function useGetAuctionById(id: string) {
  return useQuery<AuctionSummary | undefined>({
    queryKey: auctionKeys.detail(id),
    queryFn: () => fetchAuctionById(id),
    enabled: !!id,
  });
}

/**
 * Fetches auctions by category.
 */
export function useGetAuctionsByCategory(category: AuctionCategory) {
  return useQuery<PaginatedResponse<AuctionSummary>>({
    queryKey: auctionKeys.category(category),
    queryFn: () => fetchAuctionsByCategory(category),
    enabled: !!category,
  });
}

/**
 * Hook to get auctions ending soon.
 */
export function useGetClosingSoonAuctions(limit: number = 4) {
  return useQuery<AuctionSummary[]>({
    queryKey: [...auctionKeys.all, "closing-soon", limit],
    queryFn: () => fetchClosingSoonAuctions(limit),
  });
}

/**
 * Hook to get bid history for a specific auction.
 */
export function useGetBidHistory(auctionId: string) {
  return useQuery({
    queryKey: auctionKeys.bids(auctionId),
    queryFn: () => fetchBidHistory(auctionId),
    enabled: !!auctionId,
  });
}

/**
 * Hook to get similar auctions.
 */
export function useGetSimilarAuctions(
  auctionId: string,
  category: AuctionCategory,
  subcategory: AuctionSubcategory,
  limit: number = 4
) {
  return useQuery<AuctionSummary[]>({
    queryKey: [...auctionKeys.all, "similar", auctionId, category, subcategory, limit],
    queryFn: () => fetchSimilarAuctions(auctionId, category, subcategory, limit),
    enabled: !!auctionId && !!category,
  });
}

/**
 * Hook to get auctions owned by the current seller.
 */
export function useGetSellerAuctions(filters?: {
  status?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery<PaginatedResponse<AuctionSummary>>({
    queryKey: auctionKeys.seller(filters),
    queryFn: () => fetchSellerAuctions(filters),
  });
}



