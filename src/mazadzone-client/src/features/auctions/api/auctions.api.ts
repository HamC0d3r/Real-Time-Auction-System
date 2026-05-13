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
  AuctionFilters,
  AuctionSortBy,
} from "../types/auction.types";
import { AuctionStatus, AuctionSortBy as SortByValues } from "../types/auction.types";

import {
  mockAuctions,
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
 * TODO: Replace with: `api.get<AuctionSummary[]>("/auctions", { params: filters })`
 */
export async function fetchActiveAuctions(
  filters?: AuctionFilters,
): Promise<AuctionSummary[]> {
  await simulateDelay();

  let results = mockAuctions.filter((a) => a.status === AuctionStatus.ACTIVE);

  if (!filters) return results;

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

  // --- Condition filter
  if (filters.condition) {
    results = results.filter((a) => a.condition === filters.condition);
  }

  // --- Location filter
  if (filters.location) {
    results = results.filter((a) => a.location === filters.location);
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
    results = sortAuctions(results, filters.sortBy);
  }

  return results;
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
  return getMockAuctionById(id);
}

/**
 * Fetches auctions matching the given category (active only).
 *
 * TODO: Replace with: `api.get<AuctionSummary[]>("/auctions", { params: { category } })`
 */
export async function fetchAuctionsByCategory(
  category: AuctionCategory,
): Promise<AuctionSummary[]> {
  return fetchActiveAuctions({ category });
}

/**
 * Fetches all unique locations available for filtering.
 *
 * TODO: Replace with a dedicated endpoint or backend enum.
 */
export async function fetchAvailableLocations(): Promise<string[]> {
  await simulateDelay();
  const locations = new Set(mockAuctions.map((a) => a.location));
  return Array.from(locations).sort();
}

// ---------------------------------------------------------------------------
// Sorting Helpers
// ---------------------------------------------------------------------------

function sortAuctions(
  auctions: AuctionSummary[],
  sortBy: AuctionSortBy,
): AuctionSummary[] {
  const sorted = [...auctions];

  const getPrice = (a: AuctionSummary) =>
    a.pricing.currentBid ?? a.pricing.startingPrice;
  const getTime = (date: string) => new Date(date).getTime();

  const strategy: Record<AuctionSortBy, (a: AuctionSummary, b: AuctionSummary) => number> = {
    [SortByValues.ENDING_SOONEST]: (a, b) =>
      getTime(a.timing.endDate) - getTime(b.timing.endDate),
    [SortByValues.LOWEST_PRICE]: (a, b) =>
      getPrice(a) - getPrice(b),
    [SortByValues.MOST_BIDS]: (a, b) =>
      b.pricing.bidCount - a.pricing.bidCount,
    [SortByValues.NEWEST]: (a, b) =>
      getTime(b.timing.createdAt) - getTime(a.timing.createdAt),
  };

  return sorted.sort(strategy[sortBy] ?? (() => 0));
}
