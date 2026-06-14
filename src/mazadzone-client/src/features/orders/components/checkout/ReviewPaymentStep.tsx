"use client";

import { Check, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency.utils";
import type { CheckoutAddress, CheckoutPaymentMethod } from "../../types/checkout.types";

export interface ReviewPaymentStepProps {
  orderNumber: string;
  title: string;
  finalBid: number;
  depositAmount: number;
  amountDue: number;
  selectedAddress: CheckoutAddress | null;
  selectedPayment: CheckoutPaymentMethod | null;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ReviewPaymentStep({
  orderNumber,
  title,
  finalBid,
  depositAmount,
  amountDue,
  selectedAddress,
  selectedPayment,
  onConfirm,
  onCancel,
  isSubmitting,
}: ReviewPaymentStepProps) {
  if (!selectedAddress || !selectedPayment) return null;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground">Review Order Payment</h3>
        <p className="text-sm text-muted-foreground mt-1 truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Order #: {orderNumber}</p>
      </div>

      {/* Invoice Details Table */}
      <div className="border border-border/80 rounded-xl overflow-hidden bg-muted/5">
        <div className="p-4 border-b border-border/60">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Invoice Breakdown
          </h4>
        </div>
        <div className="divide-y divide-border/40 text-sm">
          <div className="flex justify-between items-center p-4">
            <span className="text-muted-foreground font-medium">Final Bid Price</span>
            <span className="font-bold text-foreground">{formatCurrency(finalBid)}</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              Security Deposit (10%)
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500 border border-emerald-200/50 px-1.5 py-0.5 rounded">
                Paid
              </span>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-500">
              -{formatCurrency(depositAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-primary/5">
            <span className="font-bold text-primary flex flex-col">
              Remaining Amount Due
              <span className="text-[10px] text-primary/70 font-semibold leading-normal">
                (90% Balance)
              </span>
            </span>
            <span className="text-lg font-black text-primary">
              {formatCurrency(amountDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipment & Payment Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 text-xs">
          <h4 className="font-bold text-foreground">Shipping To</h4>
          <div className="text-muted-foreground space-y-0.5 leading-relaxed">
            <p className="font-bold text-foreground">{selectedAddress.fullName}</p>
            <p>{selectedAddress.city}</p>
            <p className="truncate">
              {selectedAddress.streetAddress}, {selectedAddress.building}
            </p>
          </div>
        </div>
        <div className="space-y-1.5 text-xs">
          <h4 className="font-bold text-foreground">Payment Method</h4>
          <div className="text-muted-foreground space-y-0.5 leading-relaxed">
            <p className="font-bold text-foreground flex items-center gap-1">
              {selectedPayment.cardType === "UNKNOWN" ? "Card" : selectedPayment.cardType} •••• {selectedPayment.lastFourDigits}
            </p>
            <p className="truncate">{selectedPayment.cardholderName}</p>
            <p>Expires: {selectedPayment.expiryDate}</p>
          </div>
        </div>
      </div>

      {/* Important Alert Notice */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-4 text-xs md:text-sm text-amber-800 dark:text-amber-300">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Escrow Warning Notice</p>
          <p className="leading-relaxed font-medium">
            You are about to authorize the remaining payment of <span className="font-bold text-foreground">{formatCurrency(amountDue)}</span> for this order. If you fail to complete the payment, the 10% secure deposit will be charged and go to the company bank account.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-3">
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full h-14 rounded-xl text-base font-extrabold flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
          Confirm & Pay {formatCurrency(amountDue)}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
