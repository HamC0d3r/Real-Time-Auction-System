import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────

export type AuctionSortField = "endDate" | "price" | "bids" | "createdAt";

export interface AuctionFilterState {
  searchQuery: string;
  category: string | null;
  status: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: AuctionSortField;
  sortDirection: "asc" | "desc";
}

interface AuctionFilterActions {
  setSearchQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setStatus: (status: string | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setSorting: (field: AuctionSortField, direction: "asc" | "desc") => void;
  resetFilters: () => void;
}

type AuctionFilterStore = AuctionFilterState & AuctionFilterActions;

// ─── Defaults ────────────────────────────────────────────────────

const DEFAULT_FILTERS: AuctionFilterState = {
  searchQuery: "",
  category: null,
  status: null,
  minPrice: null,
  maxPrice: null,
  sortBy: "endDate",
  sortDirection: "asc",
};

// ─── Store ───────────────────────────────────────────────────────

/**
 * Auction filter/search state.
 *
 * Manages the current filter/sort state for the auctions list page.
 * Not persisted — resets on page refresh (intentional UX choice).
 */
export const useAuctionFilterStore = create<AuctionFilterStore>()((set) => ({
  ...DEFAULT_FILTERS,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategory: (category) => set({ category }),
  setStatus: (status) => set({ status }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setSorting: (sortBy, sortDirection) => set({ sortBy, sortDirection }),
  resetFilters: () => set(DEFAULT_FILTERS),
}));
