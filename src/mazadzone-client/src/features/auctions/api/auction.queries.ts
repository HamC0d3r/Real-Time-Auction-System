/**
 * React Query hooks for fetching Auctions data.
 * Fully aligned with the real backend DTO contracts.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AuctionSummary,
  AuctionCategory,
  AuctionSubcategory,
  AuctionFilters,
  PaginatedResponse,
} from "../types/auction.types";

import {
  getAuctions,
  getAuctionById,
  getSimilarAuctions,
  getRootCategories,
  getCategoryTree,
} from "./auction.api";
import type {
  CategoryDto,
} from "./auction.contracts";

import { auctionKeys } from "./auction.keys";
import {
  mapFiltersToQueryParams,
  mapAuctionsListDtoToSummary,
  mapAuctionDtoToSummary,
} from "./auction.mappers";

// Re-export query keys
export { auctionKeys };

/**
 * Fetches active auctions with optional filters and sorting.
 * Maps raw backend paginated list to presentational ViewModels.
 */
export function useGetAuctions(filters?: AuctionFilters) {
  return useQuery<PaginatedResponse<AuctionSummary>>({
    queryKey: auctionKeys.list(filters || {}),
    queryFn: async () => {
      let resolvedCategoryId: string | undefined = undefined;

      if (filters?.category && (filters.category as string) !== "all") {
        try {
          const tree = await getCategoryTree();
          const matchedCat = tree.find(
            (c) => c.name.toLowerCase() === filters.category?.toLowerCase()
          );
          if (matchedCat) {
            if (filters.subcategory && (filters.subcategory as string) !== "all") {
              const subList = matchedCat.subCategories || matchedCat.subcategories || matchedCat.children || [];
              const subQuery = filters.subcategory?.toLowerCase() || "";
              const matchedSub = subList.find(
                (s) => {
                  const sName = s.name.toLowerCase();
                  if (sName === subQuery) return true;
                  if (sName.includes(subQuery)) return true;
                  if (subQuery.includes(sName)) return true;
                  if (subQuery.startsWith("other") && sName.startsWith("other")) return true;
                  return false;
                }
              );
              if (matchedSub) {
                resolvedCategoryId = matchedSub.id;
              }
            }
          }
        } catch (err) {
          console.warn("Failed to fetch category tree for GUID mapping:", err);
        }
      }

      const queryParams = mapFiltersToQueryParams(filters);
      if (resolvedCategoryId) {
        queryParams.CategoryId = resolvedCategoryId;
      } else {
        queryParams.CategoryId = undefined;
      }
      
      // Clear SubCategoryId to ensure backend queries only use the mapped CategoryId
      queryParams.SubCategoryId = undefined;

      const raw = await getAuctions(queryParams);
      
      return {
        items: raw.items.map(mapAuctionsListDtoToSummary),
        totalCount: raw.totalCount,
        page: raw.pageNumber,
        pageSize: raw.pageSize,
        totalPages: raw.totalPages ?? Math.ceil(raw.totalCount / raw.pageSize),
        hasNextPage: raw.hasNextPage ?? false,
        hasPreviousPage: raw.hasPreviousPage ?? false,
      };
    },
  });
}

/**
 * Fetches detailed information about a single auction by ID.
 */
export function useGetAuctionById(id: string) {
  const queryClient = useQueryClient();

  return useQuery<AuctionSummary | null>({
    queryKey: auctionKeys.detail(id),
    queryFn: async () => {
      const raw = await getAuctionById(id);
      const summary = mapAuctionDtoToSummary(raw);

      // Resolve condition from list cache first (fast — no network call).
      // The list cache is already populated when the user navigated from the list page.
      const listsData = queryClient.getQueriesData<PaginatedResponse<AuctionSummary>>({
        queryKey: auctionKeys.lists(),
      });

      let cachedItem: AuctionSummary | undefined;
      for (const [_, data] of listsData) {
        if (data?.items) {
          cachedItem = data.items.find((item) => item.id === id);
          if (cachedItem) break;
        }
      }

      if (cachedItem) {
        // Use cached condition — no extra network call needed
        summary.condition = cachedItem.condition;
        summary.conditionDescription = cachedItem.conditionDescription;
      }
      // Note: if no list cache exists (direct URL navigation), condition
      // falls back to the mapper default. This is acceptable — condition
      // is a static field that doesn't change in real-time.

      return summary;
    },
    enabled: !!id,
    // staleTime: 0 — every invalidateQueries call from SignalR triggers
    // an immediate background refetch so status and price stay current.
    staleTime: 0,
  });
}

/**
 * Fetches auctions by category display string.
 */
export function useGetAuctionsByCategory(category: AuctionCategory) {
  return useQuery<PaginatedResponse<AuctionSummary>>({
    queryKey: [...auctionKeys.all, "category", category],
    queryFn: async () => {
      let resolvedCategoryId: string | undefined = undefined;

      if (category && (category as string) !== "all") {
        try {
          const tree = await getCategoryTree();
          const matchedCat = tree.find(
            (c) => c.name.toLowerCase() === category.toLowerCase()
          );
          if (matchedCat) {
            resolvedCategoryId = matchedCat.id;
          }
        } catch (err) {
          console.warn("Failed to fetch category tree for GUID mapping in useGetAuctionsByCategory:", err);
        }
      }

      const raw = await getAuctions({
        Page: 1,
        PageSize: 12,
        CategoryId: resolvedCategoryId,
      });

      return {
        items: raw.items.map(mapAuctionsListDtoToSummary),
        totalCount: raw.totalCount,
        page: raw.pageNumber,
        pageSize: raw.pageSize,
        totalPages: raw.totalPages ?? 1,
        hasNextPage: raw.hasNextPage ?? false,
        hasPreviousPage: raw.hasPreviousPage ?? false,
      };
    },
    enabled: !!category,
  });
}

/**
 * Hook to get active auctions ending soon.
 */
export function useGetEndingSoonAuctions(limit: number = 4) {
  return useQuery<AuctionSummary[]>({
    queryKey: [...auctionKeys.all, "ending-soon", limit],
    queryFn: async () => {
      const raw = await getAuctions({
        Page: 1,
        PageSize: limit,
        Status: "Active",
        SortBy: "EndTime",
        SortDirection: "asc",
      });
      return raw.items.map(mapAuctionsListDtoToSummary);
    },
  });
}

/**
 * Hook to get upcoming active auctions.
 */
export function useGetUpcomingAuctions(limit: number = 4) {
  return useQuery<AuctionSummary[]>({
    queryKey: [...auctionKeys.all, "upcoming", limit],
    queryFn: async () => {
      const raw = await getAuctions({
        Page: 1,
        PageSize: limit,
        Status: "Pending",
        SortBy: "StartTime",
        SortDirection: "asc",
      });
      return raw.items.map(mapAuctionsListDtoToSummary);
    },
  });
}

/**
 * Hook to get bid history for a specific auction.
 * Extracts bid list directly from the detailed auction DTO.
 */
export function useGetBidHistory(auctionId: string) {
  return useQuery({
    queryKey: [...auctionKeys.detail(auctionId), "bids"],
    queryFn: async () => {
      const raw = await getAuctionById(auctionId);
      return (raw.bids ?? []).map((b, idx) => ({
        id: `${auctionId}-bid-${idx}`,
        bidderName: `Bidder ${b.bidderId.substring(0, 4)}`,
        bidderInitial: "B",
        amount: b.amount,
        timeAgo: new Date(b.timestamp).toLocaleDateString(),
        isHighest: idx === 0,
      }));
    },
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
  limit: number = 4,
) {
  return useQuery<AuctionSummary[]>({
    queryKey: auctionKeys.similar(auctionId, limit),
    queryFn: async () => {
      const raw = await getSimilarAuctions(auctionId, limit);
      return raw.map(mapAuctionsListDtoToSummary);
    },
    enabled: !!auctionId,
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
    queryKey: [...auctionKeys.all, "seller", filters || {}],
    queryFn: async () => {
      let statusParam = filters?.status === "All" ? undefined : filters?.status;
      if (statusParam === "Upcoming") {
        statusParam = "Pending";
      }

      const raw = await getAuctions({
        Page: filters?.page ?? 1,
        PageSize: filters?.pageSize ?? 5,
        Status: statusParam,
        SortBy: filters?.sortBy,
      });

      return {
        items: raw.items.map(mapAuctionsListDtoToSummary),
        totalCount: raw.totalCount,
        page: raw.pageNumber,
        pageSize: raw.pageSize,
        totalPages: raw.totalPages ?? 1,
        hasNextPage: raw.hasNextPage ?? false,
        hasPreviousPage: raw.hasPreviousPage ?? false,
      };
    },
  });
}

/**
 * Hook to retrieve root categories from the API.
 */
export function useGetRootCategories() {
  return useQuery<CategoryDto[]>({
    queryKey: ["categories", "roots"],
    queryFn: getRootCategories,
    staleTime: 60 * 60 * 1000, // Keep cached for 1 hour since category structure rarely changes
  });
}

/**
 * Hook to retrieve the complete categories and subcategories tree from the API.
 */
export function useGetCategoryTree() {
  return useQuery<CategoryDto[]>({
    queryKey: ["categories", "tree"],
    queryFn: getCategoryTree,
    staleTime: 60 * 60 * 1000,
  });
}
