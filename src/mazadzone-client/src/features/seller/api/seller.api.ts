import { api } from "@/lib/api/client";
import type { SellerProfile, SellerReview, ReviewReply } from "../types/seller.types";
import { mapAuctionsListDtoToSummary } from "@/features/auctions";
import type { AuctionSummary } from "@/features/auctions";
import type { PaginatedResult } from "@/types/api.types";
import { getMockSellerReviews, addMockReviewReply } from "../testing/mock-seller";
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
    const response = await api.get<any>(`/sellers/${id}/feedbacks`, {
      params: { page, pageSize },
    });
    const pagedList = response.data;
    const items = (pagedList.items || []).map((item: any) => ({
      id: item.id || "",
      reviewerName: item.authorName || "Anonymous",
      reviewerInitial: (item.authorName || "A")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase(),
      rating: item.rating || 5,
      comment: item.comment || "",
      createdAt: new Date(item.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      reply: item.reply
        ? {
            comment: item.reply,
            createdAt: "Just now",
          }
        : null,
    }));

    return {
      items,
      page: pagedList.pageNumber || page,
      pageSize: pagedList.pageSize || pageSize,
      totalCount: pagedList.totalCount || items.length,
      totalPages: pagedList.totalPages || 1,
      hasNextPage: pagedList.hasNextPage || false,
      hasPreviousPage: pagedList.hasPreviousPage || false,
    };
  } catch (error) {
    console.warn("Failed to fetch seller reviews, falling back to mock reviews:", error);
    const allReviews = getMockSellerReviews(id);
    const startIndex = (page - 1) * pageSize;
    const paginatedReviews = allReviews.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(allReviews.length / pageSize);

    return {
      items: paginatedReviews,
      page,
      pageSize,
      totalCount: allReviews.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
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
  const response = await api.get<any>("/auctions", {
    params: { SellerId: id, PageNumber: page, PageSize: pageSize },
  });

  const pagedList = response.data;
  const currentUserId = useAuthStore.getState().user?.id;
  const isOwner = id === currentUserId;

  const items = (pagedList.items || []).map((item: any) => ({
    ...mapAuctionsListDtoToSummary(item),
    isOwner,
  }));

  return {
    items,
    page: pagedList.pageNumber || page,
    pageSize: pagedList.pageSize || pageSize,
    totalCount: pagedList.totalCount || items.length,
    totalPages: pagedList.totalPages || 1,
    hasNextPage: pagedList.hasNextPage || false,
    hasPreviousPage: pagedList.hasPreviousPage || false,
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

  // Local fallback response to sync the UI state seamlessly
  const localReply = addMockReviewReply(reviewId, comment);
  if (localReply) {
    return localReply;
  }

  return {
    comment,
    createdAt: "Just now",
  };
}
