"use client";

import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency.utils";
import type { PlaceBidResponse } from "../../types/place-bid.types";

export interface BidSuccessStepProps {
  bidResponse: PlaceBidResponse | null;
  onViewAuction: () => void;
  onClose: () => void;
}

export function BidSuccessStep({
  bidResponse,
  onViewAuction,
  onClose,
}: BidSuccessStepProps) {
  if (!bidResponse) return null;

  const {
    auctionTitle,
    bidAmount,
    authorizationHold,
    paymentMethod,
  } = bidResponse;

  return (
    <div className="space-y-6 text-center py-4">
      {/* Inline styles for custom micro-animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes success-scale-up {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes success-check-draw {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-success-container {
          animation: success-scale-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-success-check {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: success-check-draw 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.25s forwards;
        }
      `}} />

      {/* Animated Success Checkmark */}
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 animate-success-container border border-emerald-200/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3.5"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              className="animate-success-check"
            />
          </svg>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-foreground">Bid Placed Successfully!</h3>
        <p className="text-xs md:text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
          Your bid of <span className="font-bold text-foreground">{formatCurrency(bidAmount)}</span> has been placed. A temporary bid deposit has been created.
        </p>
      </div>

      {/* Confirmation Summary Box */}
      <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-xs md:text-sm text-left space-y-3">
        <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground border-b border-border/40 pb-1.5 mb-1.5">
          Receipt Details
        </h4>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Item:</span>
          <span className="text-foreground font-semibold text-right truncate max-w-[200px]">
            {auctionTitle}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Your Bid:</span>
          <span className="text-foreground font-bold">{formatCurrency(bidAmount)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Bid Deposit (10%):</span>
          <span className="text-foreground font-bold">{formatCurrency(authorizationHold)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Payment Method:</span>
          <span className="text-foreground font-semibold">
            {paymentMethod.cardType === "UNKNOWN" ? "Card" : paymentMethod.cardType} •••• {paymentMethod.lastFourDigits}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 space-y-3">
        <Button
          type="button"
          onClick={onViewAuction}
          className="w-full h-12 rounded-xl text-base font-extrabold"
        >
          View Auction details
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
