import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { PublicUserProfile, UserRole } from "../types/user-profile.types";
import type { BidderProfileDto } from "./profile.contracts";
import type { PublicSellerProfileResponse } from "@/features/seller/api/seller.contracts";

/**
 * Fetches the public user profile details for a given userId.
 */
export async function getPublicUserProfile(userId: string, fetchSeller: boolean = true): Promise<PublicUserProfile> {
  const bidderRes = await api.get<BidderProfileDto>(`/bidders/${userId}`);
  const bidder = bidderRes.data;

  let seller: PublicSellerProfileResponse | null = null;
  if (fetchSeller) {
    try {
      const sellerRes = await api.get<PublicSellerProfileResponse>(`/sellers/${userId}/public`);
      seller = sellerRes.data;
    } catch {
      // If the seller API returns 404, it means the user is not a seller, which is fine.
    }
  }

  const roles: UserRole[] = ["Bidder"];
  if (seller) {
    roles.push("Seller");
  }

  const joinedDate = new Date(bidder.memberSince || new Date());

  return {
    id: bidder.id,
    fullName: bidder.fullName,
    email: bidder.email,
    phoneNumber: bidder.phoneNumber,
    avatarUrl: null,
    avatarInitial: (bidder.fullName || "AU")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase(),
    roles,
    isVerified: seller ? seller.isVerified : bidder.isVerified,
    memberSince: joinedDate.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
    status: bidder.status || "Active",
    bio: seller 
      ? `Active MazadZone registered seller since ${new Date(seller.memberSince || bidder.memberSince).toLocaleDateString()}.` 
      : `A registered bidder on MazadZone.`,
    biddingActivityCount: bidder.auctionParticipatedCount || 0,
    bidsPlacedCount: bidder.totalBidsPlaced || 0,
    wonAuctionsCount: bidder.auctionsWonCount || 0,
    completedPurchasesCount: bidder.completedPurchasesCount || 0,
    sellerRating: seller?.rating,
    reviewsCount: seller?.reviewsCount,
    salesCount: seller?.completedPurchasesCount || 0, 
  };
}

/**
 * React Query hook to get public user profile by userId.
 */
export function useGetPublicUserProfile(userId: string, fetchSeller: boolean = true) {
  return useQuery<PublicUserProfile>({
    queryKey: ["public-profile", userId, fetchSeller],
    queryFn: () => getPublicUserProfile(userId, fetchSeller),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes caching
  });
}
