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

export { auctionKeys };

const CATEGORY_TREE_KEY = ["categories", "tree"] as const;

async function resolveCategoryId(
  queryClient: ReturnType<typeof useQueryClient>,
  category?: string,
  subcategory?: string,
): Promise<string | undefined> {
  if (!category || (category as string) === "all") return undefined;

  const cached = queryClient.getQueryData<CategoryDto[]>(CATEGORY_TREE_KEY);
  const tree: CategoryDto[] = cached ?? await queryClient.fetchQuery({
    queryKey: CATEGORY_TREE_KEY,
    queryFn: getCategoryTree,
    staleTime: 60 * 60 * 1000,
  });

  const matchedCat = tree.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );
  if (!matchedCat) return undefined;

  if (!subcategory || (subcategory as string) === "all") {
    return matchedCat.id;
  }

  const subList = matchedCat.subCategories || matchedCat.subcategories || matchedCat.children || [];
  const subQuery = subcategory.toLowerCase();
  const matchedSub = subList.find((s) => {
    const sName = s.name.toLowerCase();
    if (sName === subQuery) return true;
    if (sName.includes(subQuery)) return true;
    if (subQuery.includes(sName)) return true;
    if (subQuery.startsWith("other") && sName.startsWith("other")) return true;
    return false;
  });

  return matchedSub?.id;
}

export function useGetAuctions(filters?: AuctionFilters) {
  const queryClient = useQueryClient();

  return useQuery<PaginatedResponse<AuctionSummary>>({
    queryKey: auctionKeys.list(filters || {}),
    queryFn: async () => {
      const resolvedCategoryId = await resolveCategoryId(
        queryClient,
        filters?.category,
        filters?.subcategory,
      );

      const queryParams = mapFiltersToQueryParams(filters);
      queryParams.CategoryId = resolvedCategoryId;
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

export function useGetAuctionById(id: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  return useQuery<AuctionSummary | null>({
    queryKey: auctionKeys.detail(id),
    queryFn: async () => {
      const raw = await getAuctionById(id);
      const summary = mapAuctionDtoToSummary(raw);

      const listsData = queryClient.getQueriesData<PaginatedResponse<AuctionSummary>>({
        queryKey: auctionKeys.lists(),
      });

      let cachedItem: AuctionSummary | undefined;
      for (const entry of listsData) {
        const data = entry[1];
        if (data?.items) {
          cachedItem = data.items.find((item) => item.id === id);
          if (cachedItem) break;
        }
      }

      if (cachedItem) {
        summary.condition = cachedItem.condition;
        summary.conditionDescription = cachedItem.conditionDescription;
      }

      return summary;
    },
    enabled: (options?.enabled !== undefined ? options.enabled : true) && !!id,
    staleTime: 60 * 1000,
  });
}

export function useGetAuctionsByCategory(category: AuctionCategory) {
  const queryClient = useQueryClient();

  return useQuery<PaginatedResponse<AuctionSummary>>({
    queryKey: [...auctionKeys.all, "category", category],
    queryFn: async () => {
      const resolvedCategoryId = await resolveCategoryId(queryClient, category);

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

interface HomeAuctionsData {
  endingSoon: AuctionSummary[];
  upcoming: AuctionSummary[];
}

export function useGetHomeAuctions(limit: number = 4) {
  return useQuery<HomeAuctionsData>({
    queryKey: [...auctionKeys.all, "home", limit],
    queryFn: async () => {
      const [endingSoonRaw, upcomingRaw] = await Promise.all([
        getAuctions({
          Page: 1,
          PageSize: limit,
          Status: "Active",
          SortBy: "EndTime",
          SortDirection: "asc",
        }),
        getAuctions({
          Page: 1,
          PageSize: limit,
          Status: "Pending",
          SortBy: "StartTime",
          SortDirection: "asc",
        }),
      ]);
      return {
        endingSoon: endingSoonRaw.items.map(mapAuctionsListDtoToSummary),
        upcoming: upcomingRaw.items.map(mapAuctionsListDtoToSummary),
      };
    },
  });
}

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

export function useGetRootCategories() {
  return useQuery<CategoryDto[]>({
    queryKey: [...CATEGORY_TREE_KEY, "roots"],
    queryFn: getRootCategories,
    staleTime: 60 * 60 * 1000,
  });
}

export function useGetCategoryTree() {
  return useQuery<CategoryDto[]>({
    queryKey: CATEGORY_TREE_KEY,
    queryFn: getCategoryTree,
    staleTime: 60 * 60 * 1000,
  });
}