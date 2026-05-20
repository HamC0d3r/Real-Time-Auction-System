import { useState } from "react";
import { Star, Clock, MoreVertical, CornerDownRight, MessageSquare, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { AuctionPagination } from "@/features/auctions";
import { useCreateReviewReply } from "../api/seller.queries";
import type { SellerReview } from "../types/seller.types";

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

  // Checks if the viewer owns the profile (defaults to true for mock seller-123 for demo interactivity)
  const canReply = user?.id === sellerId || sellerId === "seller-123" || sellerId === "1";

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
              }`}
          />
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card py-16 text-center shadow-xs">
        <p className="text-muted-foreground text-sm font-medium">No reviews yet for this seller.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              {/* Reviewer Details */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                  {review.reviewerInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    {review.reviewerName}
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>

              {/* Time and Actions */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5 text-muted-foreground/60" />
                <span>{review.createdAt}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full size-7 text-muted-foreground/60 hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </div>
            </div>

            {/* Comment */}
            <p className="mt-3 text-sm leading-relaxed text-foreground/90 pl-[52px]">
              {review.comment}
            </p>

            {/* Existing Reply or Reply Button */}
            <div className="pl-[52px] mt-3">
              {review.reply ? (
                <div className="rounded-lg border border-primary/10 bg-primary/2.5 p-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <CornerDownRight className="size-3.5 text-primary" />
                      <span>Your Reply</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {review.reply.createdAt}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                    {review.reply.comment}
                  </p>
                </div>
              ) : (
                canReply && (
                  <div>
                    {replyingToId === review.id ? (
                      <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3">
                        <textarea
                          placeholder="Write your reply as the seller..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground
                           focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary 
                           disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={replyMutation.isPending}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              setReplyingToId(null);
                              setReplyText("");
                            }}
                            variant="outline"
                            className="px-3 py-1.5 h-auto text-xs font-semibold cursor-pointer"
                            disabled={replyMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleReplySubmit(review.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 h-auto text-xs font-semibold cursor-pointer"
                            disabled={replyMutation.isPending || !replyText.trim()}
                          >
                            {replyMutation.isPending && (
                              <Loader2 className="size-3 animate-spin" />
                            )}
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => {
                          setReplyingToId(review.id);
                          setReplyText("");
                        }}
                        variant="link"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer p-0 h-auto"
                      >
                        <MessageSquare className="size-3.5" />
                        <span>Reply</span>
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
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
