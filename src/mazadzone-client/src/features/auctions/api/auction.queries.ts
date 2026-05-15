import { useQuery } from "@tanstack/react-query";

import type {
  AuctionSummary,
  AuctionCategory,
  AuctionFilters,
  PaginatedResponse,
} from "../types/auction.types";

import {
  fetchActiveAuctions,
  fetchAuctionById,
  fetchAuctionsByCategory,
  fetchClosingSoonAuctions,
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
  categories: () => [...auctionKeys.all, "category"] as const,
  category: (category: AuctionCategory) =>
    [...auctionKeys.categories(), category] as const,
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


