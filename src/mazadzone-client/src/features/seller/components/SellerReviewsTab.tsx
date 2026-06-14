"use client";

// Force hot-reload trigger for reviews background update layout


import { useState } from "react";
import { AuctionPagination } from "@/features/auctions";
import { useCreateReviewReply } from "../api/seller.queries";
import type { SellerReview } from "../types/seller.types";
import { useAuthStore } from "@/stores/auth.store";
import { ReviewCard } from "./reviews/ReviewCard";

interface SellerReviewsTabProps {
  sellerId: string;
  reviews: SellerReview[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SellerReviewsTab({
  sellerId,
  reviews,
  currentPage,
  totalPages,
  onPageChange,
}: SellerReviewsTabProps) {
  const { user } = useAuthStore();
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const replyMutation = useCreateReviewReply(sellerId);

  // Checks if the viewer owns the profile (strictly matches logged-in user ID)
  const canReply = user?.id === sellerId;

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      await replyMutation.mutateAsync({
        reviewId,
        comment: replyText,
      });
      setReplyingToId(null);
      setReplyText("");
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-100 bg-card py-16 text-center shadow-xs">
        <p className="text-muted-foreground text-sm font-medium">No reviews yet for this seller.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col divide-y divide-neutral-100 bg-card rounded-2xl border border-neutral-100 p-6 sm:p-8 shadow-xs">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            canReply={canReply}
            replyingToId={replyingToId}
            setReplyingToId={setReplyingToId}
            replyText={replyText}
            setReplyText={setReplyText}
            onSubmitReply={handleReplySubmit}
            isPending={replyMutation.isPending}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <AuctionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        hasPreviousPage={currentPage > 1}
        hasNextPage={currentPage < totalPages}
        className="mt-2 flex justify-center"
      />
    </div>
  );
}
