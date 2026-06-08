/**
 * Local contract representations of backend API contracts for the Seller feature.
 */

export interface PublicSellerProfileResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isVerified: boolean;
  memberSince: string;
  lastLogin: string;
  rating: number;
  reviewsCount: number;
  listedAuctionsCount: number;
  totalBidsPlaced: number;
  auctionParticipatedCount: number;
  auctionsWonCount: number;
  completedPurchasesCount: number;
}

export interface ReplyToFeedbackRequest {
  replyText: string;
}
