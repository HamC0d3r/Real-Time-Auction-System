import { api } from "@/lib/api/client";
import type { ModerateAuctionsResponse, AuctionStatus } from "../../types/admin.types";
import type { PagedListOfAuctionsListDto } from "./auctions.contracts";
import { fetchCategoriesTree } from "../categories/category.api";
import {
  mapFiltersToQueryParams,
  mapPagedAuctionsListToModerateAuctionsResponse,
  mapAuctionsListDtoToModerateAuction,
} from "./auctions.mappers";

export interface UseModerateAuctionsFilters {
  search: string;
  category: string;
  status: AuctionStatus | "All Statuses";
  sortBy: string;
  dateFrom: string;
  page: number;
  pageSize: number;
}

/**
 * Resolves human-readable category name to UUID from the category tree.
 */
async function resolveCategoryUUID(categoryName?: string): Promise<string | undefined> {
  if (!categoryName || categoryName === "All Categories") {
    return undefined;
  }

  try {
    const categories = await fetchCategoriesTree();
    // Search main categories
    const matched = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (matched) {
      return matched.id;
    }
    // Search subcategories
    for (const cat of categories) {
      const subMatched = cat.subcategories.find(
        (s) => s.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (subMatched) {
        return subMatched.id;
      }
    }
  } catch (error) {
    console.warn("Failed to resolve category name to UUID:", error);
  }

  return undefined;
}

/**
 * Fetches real filtered, paginated moderate auctions list from the backend.
 */
export async function fetchModerateAuctions(filters: UseModerateAuctionsFilters): Promise<ModerateAuctionsResponse> {
  const queryParams = mapFiltersToQueryParams(filters);
  const resolvedCategoryId = await resolveCategoryUUID(filters.category);
  if (resolvedCategoryId) {
    queryParams.CategoryId = resolvedCategoryId;
  } else {
    queryParams.CategoryId = undefined;
  }

  const response = await api.get<PagedListOfAuctionsListDto>("/auctions", {
    params: queryParams,
  });
  return mapPagedAuctionsListToModerateAuctionsResponse(response.data, filters.page, filters.pageSize);
}

/**
 * Cancels an auction listing as an administrator.
 */
export async function cancelAuctionByAdminApi(auctionId: string, reason: string): Promise<void> {
  // Respecting standard POST with no request body as defined in OpenAPI contract
  await api.post(`/auctions/${auctionId}/cancel-by-admin`);
}

/**
 * Force ends bidding on an active auction listing.
 */
export async function exportAuctionsApi(filters: UseModerateAuctionsFilters, selectedIds: string[]): Promise<Blob> {
  const queryParams = mapFiltersToQueryParams({
    ...filters,
    page: 1,
    pageSize: 200, // Fetch a larger window of rows to guarantee full match export
  });

  const resolvedCategoryId = await resolveCategoryUUID(filters.category);
  if (resolvedCategoryId) {
    queryParams.CategoryId = resolvedCategoryId;
  } else {
    queryParams.CategoryId = undefined;
  }

  const response = await api.get<PagedListOfAuctionsListDto>("/auctions", {
    params: queryParams,
  });
  const items = response.data.items || [];

  let exportItems = items.map(mapAuctionsListDtoToModerateAuction);
  if (selectedIds.length > 0) {
    exportItems = exportItems.filter((a) => selectedIds.includes(a.id));
  }

  const csvHeader = "ID,Title,Seller,Seller Email,Category,Status,Current Bid,Bid Count,Start Date,End Date\n";
  const csvRows = exportItems
    .map(
      (a) =>
        `${a.id},"${a.title}","${a.sellerName}","${a.sellerEmail}",${a.category},${a.status},${a.currentBid},${a.bidCount},${a.startDate},${a.endDate}`
    )
    .join("\n");

  return new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
}
