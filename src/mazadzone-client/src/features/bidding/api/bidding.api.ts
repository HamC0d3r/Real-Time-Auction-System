import { api } from "@/lib/api/client";
import { BidActivity, BidStatus } from "../types/bidding.types";
import { getMockAuctions } from "@/features/auctions/testing/mock-auctions";

/**
 * Fetches the user's active/ended bid activities.
 * Backed by mock data during development and structured to easily swap
 * with the real backend API endpoint by uncommenting the block below.
 */
export async function fetchMyBids(userId: string): Promise<BidActivity[]> {
  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * const { data } = await api.get<BidActivity[]>("/bids/my-bids", {
   *   params: { userId }
   * });
   * return data;
   */

  // --- MOCK IMPLEMENTATION ---
  await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate networking delay

  const mockAuctions = getMockAuctions().slice(0, 15);
  return mockAuctions.map((auction, idx) => {
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
}
