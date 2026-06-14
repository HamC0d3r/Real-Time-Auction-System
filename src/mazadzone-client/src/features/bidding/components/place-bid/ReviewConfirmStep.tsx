"use client";

import { MapPin, CreditCard, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency.utils";
import type { DeliveryAddress, SavedPaymentMethod } from "../../types/place-bid.types";

export interface ReviewConfirmStepProps {
  auctionTitle: string;
  bidAmount: number;
  currentBid: number;
  minIncrement: number;
  selectedAddress: DeliveryAddress | null;
  selectedPayment: SavedPaymentMethod | null;
  onConfirm: () => void;
  onCancel: () => void;
  onChangeAddress: () => void;
  onChangePayment: () => void;
  isSubmitting: boolean;
}

export function ReviewConfirmStep({
  auctionTitle,
  bidAmount,
  currentBid,
  minIncrement,
  selectedAddress,
  selectedPayment,
  onConfirm,
  onCancel,
  onChangeAddress,
  onChangePayment,
  isSubmitting,
}: ReviewConfirmStepProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground">Review Your Bid</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Please review your details before confirming.
        </p>
      </div>

      {/* Bid Details List */}
      <div className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3 text-xs md:text-sm">
        <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground mb-1">
          Bid Details
        </h4>
        <div className="flex justify-between items-start gap-4">
          <span className="text-muted-foreground shrink-0">Item:</span>
          <span className="text-foreground font-semibold text-right truncate max-w-[240px]">
            {auctionTitle}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Current Bid:</span>
          <span className="text-foreground font-semibold">{formatCurrency(currentBid)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Min. Increment:</span>
          <span className="text-foreground font-semibold">{formatCurrency(minIncrement)}</span>
        </div>
        <div className="border-t border-border/50 my-1 pt-2 flex justify-between items-center text-base">
          <span className="font-bold text-foreground">Your Bid:</span>
          <span className="font-black text-primary text-lg">{formatCurrency(bidAmount)}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-muted-foreground">Bid Deposit (10%):</span>
          <span className="text-foreground font-bold">{formatCurrency(bidAmount * 0.1)}</span>
        </div>
      </div>

      {/* Delivery Address Review */}
      {selectedAddress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Delivery Address
            </span>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onChangeAddress}
              className="text-xs font-bold text-primary hover:underline cursor-pointer transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Change
            </button>
          </div>
          <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs md:text-sm">
              <p className="font-bold text-foreground">{selectedAddress.label}</p>
              <p className="text-muted-foreground">
                {selectedAddress.building}, {selectedAddress.streetAddress}, {selectedAddress.city}
              </p>
              <p className="text-muted-foreground text-xs">{selectedAddress.phoneNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Review */}
      {selectedPayment && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Payment Method
            </span>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onChangePayment}
              className="text-xs font-bold text-primary hover:underline cursor-pointer transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Change
            </button>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <CreditCard className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 text-xs md:text-sm flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">
                  {selectedPayment.cardType === "UNKNOWN" ? "Card" : selectedPayment.cardType} •••• {selectedPayment.lastFourDigits}
                </p>
                <p className="text-muted-foreground text-xs">{selectedPayment.cardholderName}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                Authorized
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Warning Hold Banner */}
      <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-xl p-4 text-xs md:text-sm text-warning-foreground mt-4">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Important Notice</p>
          <p className="leading-relaxed">
            A temporary bid deposit of <span className="font-black">{formatCurrency(bidAmount * 0.1)}</span> will be placed. If you win and fail to complete the payment within the allowed time, this 10% secure deposit will be charged and go to the company bank account.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 space-y-3 border-t border-border/40">
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl text-base font-extrabold flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting Bid...
            </>
          ) : (
            "Confirm & Place Bid"
          )}
        </Button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
