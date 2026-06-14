"use client";

import type { SellerReview } from "../../types/seller.types";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewAuctionCard } from "./ReviewAuctionCard";
import { ReviewReplySection } from "./ReviewReplySection";

interface ReviewCardProps {
  review: SellerReview;
  canReply: boolean;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onSubmitReply: (reviewId: string) => void;
  isPending: boolean;
}

export function ReviewCard({
  review,
  canReply,
  replyingToId,
  setReplyingToId,
  replyText,
  setReplyText,
  onSubmitReply,
  isPending,
}: ReviewCardProps) {
  const hasAuction = !!review.auction;

  return (
    <div className="group relative py-8 first:pt-0 last:pb-0 transition-all duration-300 w-full">
      {hasAuction ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Left Column: Auction Product Details */}
          <div className="md:col-span-1">
            <ReviewAuctionCard auction={review.auction!} />
          </div>

          {/* Right Column: Review Details & Replies */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <div>
              {/* Header details */}
              <ReviewHeader
                reviewerName={review.reviewerName}
                reviewerInitial={review.reviewerInitial}
                reviewerId={review.reviewerId}
                rating={review.rating}
                createdAt={review.createdAt}
              />

              {/* Review Comment */}
              <div className="mt-4 bg-primary/5 border border-primary/10 p-4.5 rounded-2xl">
                <p className="text-base leading-relaxed text-neutral-800 font-semibold whitespace-pre-line italic">
                  "{review.comment}"
                </p>
              </div>
            </div>

            {/* Replies section */}
            <ReviewReplySection
              reviewId={review.id}
              reply={review.reply}
              canReply={canReply}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={onSubmitReply}
              isPending={isPending}
            />
          </div>
        </div>
      ) : (
        /* Full Width Layout for reviews without an auction reference */
        <div className="flex flex-col gap-3">
          <div>
            {/* Header details */}
            <ReviewHeader
              reviewerName={review.reviewerName}
              reviewerInitial={review.reviewerInitial}
              reviewerId={review.reviewerId}
              rating={review.rating}
              createdAt={review.createdAt}
            />

            {/* Review Comment */}
            <div className="mt-4 bg-primary/5 border border-primary/10 p-4.5 rounded-2xl">
              <p className="text-base leading-relaxed text-neutral-800 font-semibold whitespace-pre-line italic">
                "{review.comment}"
              </p>
            </div>
          </div>

          {/* Replies section */}
          <ReviewReplySection
            reviewId={review.id}
            reply={review.reply}
            canReply={canReply}
            replyingToId={replyingToId}
            setReplyingToId={setReplyingToId}
            replyText={replyText}
            setReplyText={setReplyText}
            onSubmitReply={onSubmitReply}
            isPending={isPending}
          />
        </div>
      )}
    </div>
  );
}
