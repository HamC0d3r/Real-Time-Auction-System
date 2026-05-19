/**
 * Auction API fetch functions.
 *
 * These async functions are the data layer consumed by TanStack Query hooks.
 * Currently backed by local mock data from `../testing/mock-auctions.ts`.
 *
 * When the ASP.NET backend is ready, swap the mock imports for real
 * `api.get()` calls — the hooks and components stay unchanged.
 *
 * @example Future backend swap:
 * ```ts
 * export async function fetchActiveAuctions(filters?: AuctionFilters) {
 *   const { data } = await api.get<AuctionSummary[]>("/auctions", { params: filters });
 *   return data;
 * }
 * ```
 */

import type {
  AuctionSummary,
  AuctionCategory,
  AuctionSubcategory,
  AuctionFilters,
  AuctionSortBy,
  PaginatedResponse,
  Auction,
  CreateAuctionInput,
  UpdateAuctionInput,
} from "../types/auction.types";
import { AuctionStatus, AuctionSortBy as SortByValues } from "../types/auction.types";
import { api } from "@/lib/api/client";

import {
  getMockAuctions,
  getMockAuctionById,
} from "../testing/mock-auctions";

// ---------------------------------------------------------------------------
// Simulated network delay (remove when switching to real API)
// ---------------------------------------------------------------------------

const MOCK_DELAY_MS = 400;

function simulateDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

// ---------------------------------------------------------------------------
// Fetch Functions (consumed by TanStack Query hooks)
// ---------------------------------------------------------------------------

/**
 * Fetches active auctions, optionally filtered and sorted.
 * 
 * Returns a paginated response.
 */
export async function fetchActiveAuctions(
  filters?: AuctionFilters,
): Promise<PaginatedResponse<AuctionSummary>> {
  await simulateDelay();

  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * const { data } = await api.get<PaginatedResponse<AuctionSummary>>("/auctions", { 
   *   params: filters 
   * });
   * return data;
   */

  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 12;

  // If status filter is provided, use it. Otherwise, default to ACTIVE.
  let results = getMockAuctions();
  
  if (filters?.status) {
    results = results.filter((a) => a.status === filters.status);
  } else {
    results = results.filter((a) => a.status === AuctionStatus.ACTIVE);
  }

  if (filters) {
    // --- Text search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter((a) =>
        a.title.toLowerCase().includes(query),
      );
    }

    // --- Category filter
    if (filters.category) {
      results = results.filter((a) => a.category === filters.category);
    }
    
    // --- Subcategory filter
    if (filters.subcategory) {
      results = results.filter((a) => a.subcategory === filters.subcategory);
    }

    // --- Condition filter
    if (filters.condition) {
      results = results.filter((a) => a.condition === filters.condition);
    }

    // --- Price range (use currentBid, fallback to startingPrice)
    if (filters.minPrice != null) {
      results = results.filter(
        (a) => (a.pricing.currentBid ?? a.pricing.startingPrice) >= filters.minPrice!,
      );
    }
    if (filters.maxPrice != null) {
      results = results.filter(
        (a) => (a.pricing.currentBid ?? a.pricing.startingPrice) <= filters.maxPrice!,
      );
    }

    // --- Sorting
    if (filters.sortBy) {
      results = sortAuctions(results, filters.sortBy, filters.sortDirection);
    }
  }

  // --- Pagination
  const totalCount = results.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = results.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    totalCount,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Fetches a single auction by ID.
 *
 * TODO: Replace with: `api.get<AuctionSummary>(`/auctions/${id}`)`
 */
export async function fetchAuctionById(
  id: string,
): Promise<AuctionSummary | undefined> {
  await simulateDelay();

  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * const { data } = await api.get<AuctionSummary>(`/auctions/${id}`);
   * return data;
   */

  return getMockAuctionById(id);
}

/**
 * Fetches auctions matching the given category (active only).
 *
 * TODO: Replace with: `api.get<AuctionSummary[]>("/auctions", { params: { category } })`
 */
export async function fetchAuctionsByCategory(
  category: AuctionCategory,
): Promise<PaginatedResponse<AuctionSummary>> {
  return fetchActiveAuctions({ category });
}

/**
 * Fetches bid history for a specific auction.
 * Bid history is embedded directly on the AuctionSummary object.
 *
 * TODO: Replace with: `api.get<BidHistoryEntry[]>(`/auctions/${auctionId}/bids`)`
 */
export async function fetchBidHistory(
  auctionId: string
): Promise<import("../types/auction.types").BidHistoryEntry[]> {
  await simulateDelay();

  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * const { data } = await api.get<import("../types/auction.types").BidHistoryEntry[]>(`/auctions/${auctionId}/bids`);
   * return data;
   */

  const auction = getMockAuctionById(auctionId);
  return auction?.bidHistory ?? [];
}

/**
 * Fetches auctions that are ending soonest.
 */
export async function fetchClosingSoonAuctions(
  limit: number = 4,
): Promise<AuctionSummary[]> {
  const response = await fetchActiveAuctions({
    status: AuctionStatus.ACTIVE,
    sortBy: SortByValues.END_TIME,
    sortDirection: "asc",
    pageSize: limit,
  });
  return response.items;
}

/**
 * Fetches similar auctions based on category/subcategory.
 * Priority: 
 * 1. Subcategory (if not "Others")
 * 2. Category
 */
export async function fetchSimilarAuctions(
  auctionId: string,
  category: AuctionCategory,
  subcategory: AuctionSubcategory,
  limit: number = 4
): Promise<AuctionSummary[]> {
  await simulateDelay();

  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * const data = await api.get<AuctionSummary[]>(`/auctions/${auctionId}/similar`, { 
   *   params: { limit } 
   * });
   * return data;
   */

  // --- MOCK IMPLEMENTATION ---
  const useCategoryOnly = subcategory === "Others";
  const allAuctions = getMockAuctions();
  
  let results = allAuctions.filter((a) => {
    // Exclude current auction and must be active
    if (a.id === auctionId || a.status !== AuctionStatus.ACTIVE) return false;

    if (useCategoryOnly) {
      return a.category === category;
    } else {
      return a.subcategory === subcategory;
    }
  });

  // If subcategory search yielded less than limit, fallback to category for more items
  if (!useCategoryOnly && results.length < limit) {
    const categoryFallbacks = allAuctions.filter((a) => {
      return (
        a.id !== auctionId && 
        a.status === AuctionStatus.ACTIVE && 
        a.category === category &&
        !results.some(r => r.id === a.id)
      );
    });
    results = [...results, ...categoryFallbacks];
  }

  return results.slice(0, limit);
}



// ---------------------------------------------------------------------------
// Sorting Helpers
// ---------------------------------------------------------------------------

function sortAuctions(
  auctions: AuctionSummary[],
  sortBy: AuctionSortBy,
  direction: "asc" | "desc" = "desc",
): AuctionSummary[] {
  const sorted = [...auctions];

  const getPrice = (a: AuctionSummary) =>
    a.pricing.currentBid ?? a.pricing.startingPrice;
  const getTime = (date: string | Date) => new Date(date).getTime();

  const strategy: Record<AuctionSortBy, (a: AuctionSummary, b: AuctionSummary) => number> = {
    [SortByValues.CREATION_DATE]: (a, b) =>
      getTime(a.timing.creationDate) - getTime(b.timing.creationDate),
    [SortByValues.PRICE]: (a, b) =>
      getPrice(a) - getPrice(b),
    [SortByValues.START_TIME]: (a, b) =>
      getTime(a.timing.startDate) - getTime(b.timing.startDate),
    [SortByValues.END_TIME]: (a, b) =>
      getTime(a.timing.endDate) - getTime(b.timing.endDate),
  };

  const comparator = strategy[sortBy] ?? (() => 0);

  return sorted.sort((a, b) => {
    const result = comparator(a, b);
    return direction === "asc" ? result : -result;
  });
}

// ---------------------------------------------------------------------------
// Creation and Update APIs (ready for backend endpoints swap)
// ---------------------------------------------------------------------------

/**
 * Helper to build FormData dynamically from a flat object, excluding specified keys.
 */
function buildFormData(
  input: Record<string, any>,
  excludeKeys: string[] = [],
): FormData {
  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (excludeKeys.includes(key)) return;
    if (value != null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  return formData;
}

/**
 * Sends a POST request to create a new auction.
 * Since creation includes local files, it always uses multipart/form-data.
 */
export async function createAuctionApi(input: CreateAuctionInput): Promise<Auction> {
  const formData = buildFormData(input, ["images"]);

  input.images.forEach((file) => {
    formData.append("images", file);
  });

  const { data } = await api.post<Auction>("/auctions", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

/**
 * Sends a PATCH request to update an existing auction.
 * Dynamically switches to multipart/form-data if new files/images are added.
 */
export async function updateAuctionApi(
  id: string,
  input: UpdateAuctionInput,
): Promise<Auction> {
  const hasFiles = input.images?.some((img) => img instanceof File);

  if (hasFiles) {
    const formData = buildFormData(input, ["images"]);

    input.images?.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      } else {
        formData.append("existingImages", image);
      }
    });

    const { data } = await api.patch<Auction>(`/auctions/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  }

  // Otherwise fallback to JSON patch request
  const { data } = await api.patch<Auction>(`/auctions/${id}`, input);
  return data;
}

/**
 * Fetches auctions owned by the current seller.
 */
export async function fetchSellerAuctions(
  filters?: { status?: string; sortBy?: string; page?: number; pageSize?: number }
): Promise<PaginatedResponse<AuctionSummary>> {
  await simulateDelay();

  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * const { data } = await api.get<PaginatedResponse<AuctionSummary>>("/auctions/seller", { 
   *   params: filters 
   * });
   * return data;
   */

  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 5;

  // Map every 3rd mock auction as owned by the current seller to simulate a rich list of owned auctions
  let results = getMockAuctions().map((a, idx) => ({
    ...a,
    isOwner: idx % 3 === 0,
  })).filter(a => a.isOwner);

  // Apply status filter: "Active", "Sold", "Pending", "Ended"
  if (filters?.status && filters.status !== "All" && filters.status !== "All Statuses") {
    const status = filters.status.toLowerCase();
    results = results.filter((a) => {
      if (status === "active") {
        return a.status === AuctionStatus.ACTIVE;
      }
      if (status === "sold") {
        return a.status === AuctionStatus.ENDED && a.pricing.bidCount > 0;
      }
      if (status === "pending") {
        return a.status === AuctionStatus.UPCOMING;
      }
      if (status === "ended") {
        return a.status === AuctionStatus.ENDED && a.pricing.bidCount === 0;
      }
      return true;
    });
  }

  // Apply sorting
  if (filters?.sortBy) {
    const sortBy = filters.sortBy;
    const getPrice = (a: AuctionSummary) => a.pricing.currentBid ?? a.pricing.startingPrice;
    const getTime = (date: string | Date) => new Date(date).getTime();

    if (sortBy === "EndDate") {
      results.sort((a, b) => getTime(a.timing.endDate) - getTime(b.timing.endDate));
    } else if (sortBy === "CurrentBid") {
      results.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === "DateCreated") {
      results.sort((a, b) => getTime(b.timing.creationDate) - getTime(a.timing.creationDate));
    }
  }

  // Pagination
  const totalCount = results.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = results.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    totalCount,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

import type { ApiResponse } from "@/types/api.types";

/**
 * Sends a DELETE request to delete an auction.
 */
export async function deleteAuctionApi(id: string): Promise<ApiResponse<void>> {
  await simulateDelay();

  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * return api.delete<void>(`/auctions/${id}`);
   */

  return {
    data: undefined as any,
    message: "Auction listing has been deleted successfully.",
    success: true,
    timestamp: new Date().toISOString(),
  };
}

