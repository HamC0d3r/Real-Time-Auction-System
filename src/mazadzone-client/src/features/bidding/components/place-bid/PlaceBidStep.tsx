"use client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Minus, Plus, MapPin, CreditCard, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPriceOnBlur, unformatPriceOnFocus } from "@/utils/currency.utils";
import type { DeliveryAddress, SavedPaymentMethod } from "../../types/place-bid.types";

export interface PlaceBidStepProps {
  auctionTitle: string;
  currentBid: number;
  minIncrement: number;
  bidAmount: number;
  onBidAmountChange: (amount: number) => void;
  selectedAddress: DeliveryAddress | null;
  selectedPayment: SavedPaymentMethod | null;
  onChangeAddress: () => void;
  onAddPayment: () => void;
  onContinue: () => void;
  onCancel: () => void;
}

export const PlaceBidStep = memo(function PlaceBidStep({
  auctionTitle,
  currentBid,
  minIncrement,
  bidAmount,
  onBidAmountChange,
  selectedAddress,
  selectedPayment,
  onChangeAddress,
  onAddPayment,
  onContinue,
  onCancel,
}: PlaceBidStepProps) {
  const minBid = currentBid + minIncrement;
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(() =>
    formatPriceOnBlur(String(bidAmount)),
  );
  const [validationError, setValidationError] = useState<string | null>(() => {
    if (bidAmount < minBid) {
      return `Bid amount must be at least ${minBid.toFixed(2)} JD (Current Bid + Min. Increment)`;
    }
    return null;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const bidAmountRef = useRef(bidAmount);
  const minIncrementRef = useRef(minIncrement);
  const minBidRef = useRef(minBid);
  const isFocusedRef = useRef(isFocused);

  useEffect(() => { bidAmountRef.current = bidAmount; }, [bidAmount]);
  useEffect(() => { minIncrementRef.current = minIncrement; }, [minIncrement]);
  useEffect(() => { minBidRef.current = minBid; }, [minBid]);
  useEffect(() => { isFocusedRef.current = isFocused; }, [isFocused]);

  const bidSchema = useMemo(
    () =>
      z.number().min(minBid, {
        message: `Bid amount must be at least ${minBid.toFixed(2)} JD (Current Bid + Min. Increment)`,
      }),
    [minBid],
  );

  const validateBidAmount = useCallback(
    (amount: number) => {
      const result = bidSchema.safeParse(amount);
      if (!result.success) {
        setValidationError(result.error.issues[0].message);
        return false;
      }
      setValidationError(null);
      return true;
    },
    [bidSchema],
  );

  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatPriceOnBlur(String(bidAmount)));
    }
  }, [bidAmount, isFocused]);

  const handleIncrement = useCallback(() => {
    const nextAmount = Math.round(bidAmountRef.current + minIncrementRef.current);
    onBidAmountChange(nextAmount);
    const formatted = isFocusedRef.current
      ? nextAmount.toFixed(2)
      : formatPriceOnBlur(String(nextAmount));
    setInputValue(formatted);
    validateBidAmount(nextAmount);
  }, [onBidAmountChange, validateBidAmount]);

  const handleDecrement = useCallback(() => {
    const nextAmount = Math.round(bidAmountRef.current - minIncrementRef.current);
    if (nextAmount >= minBidRef.current) {
      onBidAmountChange(nextAmount);
      const formatted = isFocusedRef.current
        ? nextAmount.toFixed(2)
        : formatPriceOnBlur(String(nextAmount));
      setInputValue(formatted);
      validateBidAmount(nextAmount);
    }
  }, [onBidAmountChange, validateBidAmount]);

  const stopHold = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startHold = useCallback((action: "increment" | "decrement") => {
    stopHold();
    if (action === "increment") {
      handleIncrement();
    } else {
      handleDecrement();
    }
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (action === "increment") {
          handleIncrement();
        } else {
          handleDecrement();
        }
      }, 75);
    }, 400);
  }, [handleIncrement, handleDecrement, stopHold]);

  useEffect(() => {
    return () => stopHold();
  }, [stopHold]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + "." + parts[1].slice(0, 2);
    }

    setInputValue(val);

    const parsed = Math.round(parseFloat(val));
    if (!isNaN(parsed)) {
      onBidAmountChange(parsed);
      validateBidAmount(parsed);
    } else {
      setValidationError("Please enter a valid bid amount");
    }
  }, [onBidAmountChange, validateBidAmount]);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    setInputValue(unformatPriceOnFocus(inputValue));
  }, [inputValue]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = Math.round(parseFloat(inputValue));
    if (isNaN(parsed) || parsed < minBid) {
      onBidAmountChange(minBid);
      setInputValue(formatPriceOnBlur(String(minBid)));
      setValidationError(null);
    } else {
      setInputValue(formatPriceOnBlur(String(parsed)));
      onBidAmountChange(parsed);
      validateBidAmount(parsed);
    }
  }, [inputValue, minBid, onBidAmountChange, validateBidAmount]);

  const isContinueDisabled = !selectedAddress || !selectedPayment || bidAmount < minBid || !!validationError;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h3 className="text-2xl font-bold text-foreground">Place Bid</h3>
        <p className="text-sm text-muted-foreground mt-1 truncate">{auctionTitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/15 border border-border/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground">Current Bid</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(currentBid)}</p>
        </div>
        <div className="bg-muted/15 border border-border/20 rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground">Min. Increment</p>
          <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(minIncrement)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground block">Your Bid</label>
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onMouseDown={() => startHold("decrement")}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold("decrement");
            }}
            onTouchEnd={stopHold}
            disabled={bidAmount <= minBid}
            className="h-12 w-12 rounded-xl border border-border flex items-center justify-center bg-muted/10 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer text-foreground font-bold"
            aria-label="Decrease bid"
          >
            <Minus className="h-5 w-5 stroke-[2.5]" />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="h-12 w-full bg-input-background border border-border rounded-xl text-center font-bold text-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary pl-8 pr-4"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">
              JD
            </span>
          </div>

          <button
            type="button"
            onMouseDown={() => startHold("increment")}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold("increment");
            }}
            onTouchEnd={stopHold}
            className="h-12 w-12 rounded-xl border border-border flex items-center justify-center bg-muted/10 hover:bg-muted active:scale-95 transition-all cursor-pointer text-primary hover:text-primary/80 font-bold"
            aria-label="Increase bid"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>
        {validationError && (
          <p className="text-xs text-red-500 font-bold flex items-center justify-center gap-1 mt-1 animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {validationError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground block">Delivery Address</label>
        {selectedAddress ? (
          <div className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs md:text-sm text-left">
                <p className="font-bold text-foreground">{selectedAddress.label}</p>
                <p className="text-muted-foreground">{selectedAddress.city}</p>
                <p className="text-muted-foreground">{selectedAddress.streetAddress}, {selectedAddress.building}</p>
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
              <span>No delivery address selected</span>
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

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground block">Payment Method</label>
        {selectedPayment ? (
          <div className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs md:text-sm text-left">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground">{selectedPayment.cardType === "UNKNOWN" ? "Card" : selectedPayment.cardType} •••• {selectedPayment.lastFourDigits}</p>
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
                <p className="font-bold text-foreground text-sm">No payment method added</p>
                <p className="text-xs text-muted-foreground">Add a payment method to secure your bid.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onAddPayment}
              className="text-sm font-bold text-primary hover:underline cursor-pointer transition-colors shrink-0"
            >
              Add payment method
            </button>
          </div>
        )}
      </div>

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
});
