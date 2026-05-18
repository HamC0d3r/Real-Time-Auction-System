import { api } from "@/lib/api/client";
import { BidActivity, BidStatus } from "../types/bidding.types";
import { getMockAuctions } from "@/features/auctions/testing/mock-auctions";

/**
 * Fetches the user's active/ended bid activities.
 * Backed by mock data during development and structured to easily swap
 * with the real backend API endpoint by uncommenting the block below.
 */
export interface BidActivityResponse {
  items: BidActivity[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Fetches the user's active/ended bid activities.
 * Backed by mock data during development and structured to easily swap
 * with the real backend API endpoint by uncommenting the block below.
 */
export async function fetchMyBids(
  userId: string,
  params: { filter?: string; sortBy?: string; page?: number; pageSize?: number } = {}
): Promise<BidActivityResponse> {
  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * const { data } = await api.get<BidActivityResponse>("/bids/my-bids", {
   *   params: { userId, ...params }
   * });
   * return data;
   */

  // --- MOCK IMPLEMENTATION ---
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate networking delay

  const mockAuctions = getMockAuctions().slice(0, 15);
  const allBids: BidActivity[] = mockAuctions.map((auction, idx) => {
    let status: BidStatus = "Leading";
    if (auction.status === "Ended") {
      status = "Ended";
    } else if (idx % 3 === 1) {
      status = "Outbid";
    } else if (idx % 3 === 2) {
      status = "Ended";
    }

    const currentBid = auction.pricing.currentBid || auction.pricing.startingPrice;
    const yourBid = status === "Leading" ? currentBid : currentBid - 75;

    return {
      id: `bid-${auction.id}`,
      auction,
      yourBid,
      status,
    };
  });

  // Filter
  const filter = params.filter || "All";
  const filteredBids = allBids.filter((bid) => {
    if (filter === "All") return true;
    return bid.status === filter;
  });

  // Sort
  const sortBy = params.sortBy || "latest";
  const sortedBids = [...filteredBids].sort((a, b) => {
    const timeA = new Date(a.auction.timing.endDate).getTime();
    const timeB = new Date(b.auction.timing.endDate).getTime();
    if (sortBy === "latest") {
      return timeA - timeB;
    }
    if (sortBy === "oldest") {
      return timeB - timeA;
    }
    return 0;
  });

  // Paginate
  const page = params.page || 1;
  const pageSize = params.pageSize || 5;
  const totalCount = sortedBids.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const offset = (page - 1) * pageSize;
  const items = sortedBids.slice(offset, offset + pageSize);

  return {
    items,
    page,
    totalPages,
    totalCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}
