"use client";

import { CornerDownRight, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReviewReply } from "../../types/seller.types";

interface ReviewReplySectionProps {
  reviewId: string;
  reply: ReviewReply | null;
  canReply: boolean;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onSubmitReply: (reviewId: string) => void;
  isPending: boolean;
}

export function ReviewReplySection({
  reviewId,
  reply,
  canReply,
  replyingToId,
  setReplyingToId,
  replyText,
  setReplyText,
  onSubmitReply,
  isPending,
}: ReviewReplySectionProps) {
  return (
    <div className="relative mt-4">
      {reply ? (
        <div className="relative pl-6">
          {/* Visual Left Thread Track Line */}
          <div className="absolute left-1.5 top-0 bottom-4 w-0.5 bg-neutral-200 rounded-full" />
          <div className="absolute left-1.5 top-5 w-3 h-0.5 bg-neutral-200 rounded-full" />

          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4.5 max-w-2xl shadow-3xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 uppercase tracking-wider">
                <CornerDownRight className="size-3.5 text-neutral-450" />
                <span className="text-primary font-extrabold">Seller Response</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-semibold bg-white/80 px-2 py-0.5 rounded-md border border-neutral-100">
                {reply.createdAt}
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-neutral-600 font-medium whitespace-pre-line">
              {reply.comment}
            </p>
          </div>
        </div>
      ) : (
        canReply && (
          <div className="mt-2">
            {replyingToId === reviewId ? (
              <div className="relative pl-6">
                {/* Visual Left Thread Track Line */}
                <div className="absolute left-1.5 top-0 bottom-6 w-0.5 bg-neutral-200 rounded-full" />
                <div className="absolute left-1.5 top-5 w-3 h-0.5 bg-neutral-200 rounded-full" />

                <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5 shadow-3xs">
                  <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <CornerDownRight className="size-3.5 text-neutral-450" />
                    Reply as the Seller
                  </span>
                  <textarea
                    placeholder="Write a response... Your reply will be visible to everyone visiting your profile."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[85px] w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm placeholder:text-neutral-405
                     focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary 
                     disabled:cursor-not-allowed disabled:opacity-50 resize-y leading-relaxed"
                    disabled={isPending}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setReplyingToId(null);
                        setReplyText("");
                      }}
                      variant="outline"
                      className="px-4 py-2 h-auto text-xs font-bold cursor-pointer rounded-xl border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => onSubmitReply(reviewId)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 h-auto text-xs font-bold cursor-pointer rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200"
                      disabled={isPending || !replyText.trim()}
                    >
                      {isPending && (
                        <Loader2 className="size-3.5 animate-spin mr-1" />
                      )}
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setReplyingToId(reviewId);
                  setReplyText("");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 h-10 text-sm font-extrabold cursor-pointer rounded-xl border border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-3xs"
              >
                <MessageSquare className="size-4" />
                <span>Write a Reply</span>
              </Button>
            )}
          </div>
        )
      )}
    </div>
  );
}
