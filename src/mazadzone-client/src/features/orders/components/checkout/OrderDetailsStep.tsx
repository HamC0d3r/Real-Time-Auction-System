"use client";

import { MapPin, CreditCard, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency.utils";
import type { CheckoutAddress, CheckoutPaymentMethod } from "../../types/checkout.types";

export interface OrderDetailsStepProps {
  orderNumber: string;
  title: string;
  imageUrl: string;
  finalBid: number;
  depositAmount: number;
  amountDue: number;
  selectedAddress: CheckoutAddress | null;
  selectedPayment: CheckoutPaymentMethod | null;
  onChangeAddress: () => void;
  onAddPayment: () => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function OrderDetailsStep({
  orderNumber,
  title,
  imageUrl,
  finalBid,
  depositAmount,
  amountDue,
  selectedAddress,
  selectedPayment,
  onChangeAddress,
  onAddPayment,
  onContinue,
  onCancel,
}: OrderDetailsStepProps) {
  const isContinueDisabled = !selectedAddress || !selectedPayment;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-foreground">Complete Payment</h3>
        <p className="text-sm text-muted-foreground mt-1 truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Order #: {orderNumber}</p>
      </div>

      {/* Pricing Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/15 border border-border/20 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Final Bid
          </p>
          <p className="text-lg font-bold text-foreground mt-1 truncate">
            {formatCurrency(finalBid)}
          </p>
        </div>
        <div className="bg-muted/15 border border-border/20 rounded-xl p-3 text-center">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Deposit (10%)
          </p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-500 mt-1 truncate">
            -{formatCurrency(depositAmount)}
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
            Amount Due
          </p>
          <p className="text-lg font-black text-primary mt-1 truncate">
            {formatCurrency(amountDue)}
          </p>
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground block">
          Shipping Address
        </label>
        {selectedAddress ? (
          <div className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs md:text-sm text-left">
                <p className="font-bold text-foreground">{selectedAddress.label}</p>
                <p className="text-muted-foreground">{selectedAddress.city}</p>
                <p className="text-muted-foreground">
                  {selectedAddress.streetAddress}, {selectedAddress.building}
                </p>
                <p className="text-muted-foreground">Phone: {selectedAddress.phoneNumber}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onChangeAddress}
              className="text-sm font-bold text-primary hover:underline cursor-pointer transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 border border-dashed border-border rounded-xl bg-card">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <MapPin className="h-5 w-5 shrink-0" />
              <span>No shipping address selected</span>
            </div>
            <button
              type="button"
              onClick={onChangeAddress}
              className="text-sm font-bold text-primary hover:underline cursor-pointer transition-colors"
            >
              Add Address
            </button>
          </div>
        )}
      </div>

      {/* Payment Method Section */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground block">
          Payment Method
        </label>
        {selectedPayment ? (
          <div className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs md:text-sm text-left">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground">
                    {selectedPayment.cardType === "UNKNOWN" ? "Card" : selectedPayment.cardType} •••• {selectedPayment.lastFourDigits}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                    Active
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">{selectedPayment.cardholderName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAddPayment}
              className="text-sm font-bold text-primary hover:underline cursor-pointer transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 border border-dashed border-border rounded-xl bg-card">
            <div className="flex items-start gap-3 text-left">
              <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-foreground text-sm">No payment card authorized</p>
                <p className="text-xs text-muted-foreground">Authorize your card to pay the remaining 90% balance.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAddPayment}
              className="text-sm font-bold text-primary hover:underline cursor-pointer transition-colors shrink-0"
            >
              Add card
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 space-y-3">
        <Button
          type="button"
          onClick={onContinue}
          disabled={isContinueDisabled}
          className="w-full h-14 rounded-xl text-base font-extrabold"
        >
          Continue
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
