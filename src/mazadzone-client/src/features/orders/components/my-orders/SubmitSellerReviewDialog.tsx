"use client";

import { memo, useState } from "react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useAppToast } from "@/lib/toast/app-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubmitSellerReview } from "@/features/seller";
import { cn } from "@/lib/utils";

interface SubmitSellerReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  sellerId: string;
  sellerName: string;
  itemName: string;
}

export const SubmitSellerReviewDialog = memo(function SubmitSellerReviewDialog({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  sellerId,
  sellerName,
  itemName,
}: SubmitSellerReviewDialogProps) {
  const { user } = useAuthStore();
  const appToast = useAppToast();

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Setup the API backend-ready mutation
  const submitMutation = useSubmitSellerReview(sellerId);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    setError(null);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating of at least 1 star.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a short comment about your experience.");
      return;
    }

    try {
      const reviewerId = user?.id || "";

      // Execute backend ready mutation
      await submitMutation.mutateAsync({
        reviewerId,
        sellerId,
        rating,
        comment: comment.trim(),
        orderId,
      });

      appToast.success("Review Submitted", `Your feedback for ${sellerName} has been recorded successfully!`);

      // Reset form state & close dialog
      setRating(0);
      setComment("");
      setError(null);
      onClose();
    } catch (err) {
      setError("Failed to submit review. Please try again.");
      console.error(err);
    }
  };

  const handleClose = () => {
    // Reset state before closing
    setRating(0);
    setComment("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[480px] p-6 bg-card border border-border rounded-2xl shadow-lg">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-primary">
            <MessageSquare className="size-5 shrink-0" />
            <DialogTitle className="text-xl font-bold tracking-tight">
              Submit Seller Review
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Your review is public and will appear on the seller&apos;s profile page. Feedback helps ensure trust and transparency within the MazadZone community.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4 border-y border-border/60 my-2">
          {/* Metadata Block */}
          <div className="bg-muted/30 border border-border/40 rounded-xl p-3.5 flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-semibold">Seller:</span>
              <span className="font-bold text-foreground">{sellerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-semibold">Item:</span>
              <span className="font-semibold text-foreground truncate max-w-[240px]">{itemName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-semibold">Order ID:</span>
              <span className="font-semibold text-foreground">{orderNumber}</span>
            </div>
          </div>

          {/* Interactive Star Selection */}
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-sm font-bold text-foreground tracking-wide">
              Rate your experience with this seller:
            </span>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const active = starValue <= (hoverRating || rating);
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => handleStarClick(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer transition-transform hover:scale-115 duration-200 outline-hidden"
                  >
                    <Star
                      className={cn(
                        "size-9 shrink-0 transition-colors",
                        active
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground/30 fill-transparent"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <span className="text-xs font-black text-amber-500 uppercase tracking-widest leading-none">
                {rating === 1 && "Terrible"}
                {rating === 2 && "Poor"}
                {rating === 3 && "Average"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            )}
          </div>

          {/* Textarea review comment */}
          <div className="flex flex-col gap-2">
            <label htmlFor="review-comment" className="text-sm font-bold text-foreground">
              Review Comment
            </label>
            <Textarea
              id="review-comment"
              placeholder="Write a brief summary of how the seller handled packaging, shipping times, communication, etc..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError(null);
              }}
              rows={4}
              className="resize-none rounded-xl border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitMutation.isPending}
            />
          </div>

          {/* Validation error display */}
          {error && (
            <p className="text-xs font-semibold text-destructive mt-1 text-center bg-destructive/5 py-2 rounded-lg border border-destructive/10">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex sm:flex-row gap-2 mt-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="flex-1 font-semibold rounded-xl text-sm h-11 border-border bg-card hover:bg-muted text-foreground cursor-pointer transition-colors"
            disabled={submitMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1 font-semibold rounded-xl text-sm h-11 cursor-pointer transition-colors bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5"
            disabled={submitMutation.isPending || rating === 0 || !comment.trim()}
          >
            {submitMutation.isPending && (
              <Loader2 className="size-4 animate-spin shrink-0" />
            )}
            {submitMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
