import type { AuthUser } from "@/stores/auth.store";

export interface ReviewReply {
  comment: string;
  createdAt: string;
}

export interface SellerReview {
  id: string;
  reviewerName: string;
  reviewerInitial: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  reply: ReviewReply | null;
  reviewerId?: string;
  auction?: {
    id: string;
    title: string;
    imageUrl: string;
  } | null;
}

export interface SellerProfile extends AuthUser {
  avatarUrl: string | null;
  avatarInitial: string;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  memberSince: string;
  salesCount: number;
  bio: string;
}
