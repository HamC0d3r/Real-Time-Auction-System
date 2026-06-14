import { api } from "@/lib/api/client";
import type { SellerProfile, SellerReview, ReviewReply } from "../types/seller.types";
import { mapAuctionsListDtoToSummary } from "@/features/auctions";
import type { AuctionSummary } from "@/features/auctions";
import type { AuctionsListDto } from "@/features/auctions/api/auction.contracts";
import type { PaginatedResult } from "@/types/api.types";
import type { PublicSellerProfileResponse } from "./seller.contracts";
import type { BidderProfileDto } from "@/features/profile";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Fetches the public seller profile information by combining the public seller stats
 * and their bidder profile details.
 */
export async function fetchSellerProfile(id: string): Promise<SellerProfile> {
  const [sellerRes, bidderRes] = await Promise.all([
    api.get<PublicSellerProfileResponse>(`/sellers/${id}/public`),
    api.get<BidderProfileDto>(`/bidders/${id}`),
  ]);

  const seller = sellerRes.data;
  const bidder = bidderRes.data;

  const joinedDate = new Date(seller.memberSince || bidder.memberSince || new Date());

  return {
    id: bidder.id,
    fullName: bidder.fullName,
    email: bidder.email,
    role: "seller",
    avatarUrl: null,
    avatarInitial: bidder.fullName ? bidder.fullName.charAt(0).toUpperCase() : "S",
    isVerified: seller.isVerified,
    rating: seller.rating,
    reviewsCount: seller.reviewsCount,
    memberSince: joinedDate.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
    salesCount: seller.completedPurchasesCount || bidder.completedPurchasesCount || 0,
    bio: `Active MazadZone registered seller since ${joinedDate.toLocaleDateString()}.`,
  };
}

/**
 * Fetches the paginated reviews list of a specific seller.
 * Retrieves real feedbacks from the backend API if available, otherwise falls back to local mocks.
 */
export async function fetchSellerReviews(
  id: string,
  page: number,
  pageSize: number
): Promise<PaginatedResult<SellerReview>> {
  try {
    const response = await api.get<Record<string, unknown>>(`/sellers/${id}/feedbacks`, {
      params: { page, pageSize },
    });
    const pagedList = response.data;
    const items = (pagedList.items as Record<string, unknown>[] || []).map((item) => {
      const authorName = String(item.authorName ?? "Anonymous");
      return {
        id: String(item.id ?? ""),
        reviewerName: authorName,
        reviewerInitial: authorName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        rating: Number(item.rating ?? 5),
        comment: String(item.comment ?? ""),
        createdAt: new Date(String(item.createdAt)).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        reply: item.reply
          ? {
              comment: String(item.reply),
              createdAt: "Just now",
            }
          : null,
        reviewerId: item.authorId ? String(item.authorId) : undefined,
        auction: item.auctionId
          ? {
              id: String(item.auctionId ?? ""),
              title: String(item.auctionTitle ?? ""),
              imageUrl: String(item.auctionImageUrl ?? ""),
            }
          : item.auction
          ? {
              id: String((item.auction as Record<string, unknown>).id ?? ""),
              title: String((item.auction as Record<string, unknown>).title ?? ""),
              imageUrl: String((item.auction as Record<string, unknown>).imageUrl ?? ""),
            }
          : null,
      };
    });

    return {
      items,
      page: Number(pagedList.pageNumber) || page,
      pageSize: Number(pagedList.pageSize) || pageSize,
      totalCount: Number(pagedList.totalCount) || items.length,
      totalPages: Number(pagedList.totalPages) || 1,
      hasNextPage: Boolean(pagedList.hasNextPage) || false,
      hasPreviousPage: Boolean(pagedList.hasPreviousPage) || false,
    };
  } catch (error) {
    console.error("Failed to fetch seller reviews:", error);
    throw error;
  }
}

/**
 * Fetches the paginated auctions list owned by a specific seller using real REST query filters.
 */
export async function fetchSellerAuctions(
  id: string,
  page: number,
  pageSize: number
): Promise<PaginatedResult<AuctionSummary>> {
  const response = await api.get<Record<string, unknown>>("/auctions", {
    params: { SellerId: id, PageNumber: page, PageSize: pageSize },
  });

  const pagedList = response.data;
  const currentUserId = useAuthStore.getState().user?.id;
  const isOwner = id === currentUserId;

  const items = ((pagedList.items as Record<string, unknown>[]) || []).map((item) => ({
    ...mapAuctionsListDtoToSummary(item as unknown as AuctionsListDto),
    isOwner,
  }));

  return {
    items,
    page: Number(pagedList.pageNumber) || page,
    pageSize: Number(pagedList.pageSize) || pageSize,
    totalCount: Number(pagedList.totalCount) || items.length,
    totalPages: Number(pagedList.totalPages) || 1,
    hasNextPage: Boolean(pagedList.hasNextPage) || false,
    hasPreviousPage: Boolean(pagedList.hasPreviousPage) || false,
  };
}

/**
 * Submits a seller reply to a specific review left on a completed order.
 */
export async function submitReviewReply(
  sellerId: string,
  reviewId: string,
  comment: string
): Promise<ReviewReply> {
  // Fire real POST request to reply to the order's feedback
  await api.post(`/orders/api/orders/${reviewId}/feedback/reply`, {
    replyText: comment,
  });

  return {
    comment,
    createdAt: "Just now",
  };
}
