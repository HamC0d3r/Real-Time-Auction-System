"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, Loader2, Plus, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCardForm } from "./CreditCardForm";
import { type CreditCardFormValues } from "../validations/creditCard.schema";
import { type PayoutDetails, type PaymentCardBrand, type SavedPaymentMethod } from "../types";
import { useAddPaymentMethod } from "../api/payment.mutations";
import { useGetSavedPaymentMethods } from "../api/payment.queries";
import { useAuthStore } from "@/stores/auth.store";
import type { PaymentCardBrandCode } from "../api/payment.contracts";
import type { ApiError } from "@/types/api.types";
import { cn } from "@/lib/utils";

export interface PaymentMethodDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePayout?: (details: PayoutDetails) => void;
  onSaveCard?: (card: SavedPaymentMethod) => void;
  selectedPaymentMethodId?: string | null;
  mode: "payment" | "payout";
  amount?: number;
  deliveryAddress?: {
    fullName: string;
    streetAddress: string;
    building: string;
    city: string;
  } | null;
}

export function PaymentMethodDrawer({
  isOpen,
  onClose,
  onSavePayout,
  onSaveCard,
  selectedPaymentMethodId,
  mode,
  amount = 0,
  deliveryAddress,
}: PaymentMethodDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const addPaymentMethodMutation = useAddPaymentMethod();
  const {
    data: savedPaymentMethods = [],
    isLoading: isLoadingSavedPaymentMethods,
    isError: isSavedPaymentMethodsError,
  } = useGetSavedPaymentMethods({ enabled: isOpen });

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    const apiError = error as Partial<ApiError> | null;
    if (apiError?.message) {
      return apiError.message;
    }

    return "An unexpected error occurred while saving your payment method.";
  };

  const getCardBrand = (num: string): PaymentCardBrand => {
    const cleanNum = num.replace(/\s/g, "");
    if (cleanNum.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(cleanNum)) return "MASTERCARD";
    if (/^3[47]/.test(cleanNum)) return "AMEX";
    return "UNKNOWN";
  };

  const getCardBrandEnum = (brand: PaymentCardBrand): PaymentCardBrandCode => {
    switch (brand) {
      case "VISA":
        return 1;
      case "MASTERCARD":
        return 2;
      case "AMEX":
        return 3;
      case "MADA":
        return 4;
      default:
        return 0; // Unknown
    }
  };

  const handleClose = () => {
    setShowNewCardForm(false);
    setSubmitError(null);
    onClose();
  };

  const handleUseSavedCard = (paymentMethod: SavedPaymentMethod) => {
    if (mode === "payout" && onSavePayout) {
      onSavePayout({
        type: "card",
        paymentMethodId: paymentMethod.id,
        cardNumber: `•••• ${paymentMethod.lastFourDigits}`,
        lastFourDigits: paymentMethod.lastFourDigits,
        cardType: paymentMethod.cardType,
        expiryDate: paymentMethod.expiryDate,
        cvv: "",
        cardholderName: paymentMethod.cardholderName,
      });
      handleClose();
      return;
    }

    onSaveCard?.(paymentMethod);
  };

  const handleFormSave = async (data: CreditCardFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const cleanNum = data.cardNumber.replace(/\s/g, "");
      const lastFour = cleanNum.slice(-4);
      const cardBrand = getCardBrand(data.cardNumber);
      const cardBrandEnum = getCardBrandEnum(cardBrand);

      const expiryParts = data.expiryDate.split("/");
      const expiryMonth = parseInt(expiryParts[0], 10);
      const expiryYear = 2000 + parseInt(expiryParts[1], 10);

      // Perform real backend HTTP call hitting "/api/v1/users/me/payment-methods"
      const response = await addPaymentMethodMutation.mutateAsync({
        last4Digits: lastFour,
        expiryMonth,
        expiryYear,
        cardholderName: user?.fullName || "Cardholder Name",
        brand: cardBrandEnum,
        gatewayToken: `pm_mock_${Math.random().toString(36).substring(2, 10)}`,
        isDefault: savedPaymentMethods.length === 0,
      });

      if (mode === "payout" && onSavePayout) {
        onSavePayout({
          type: "card",
          paymentMethodId: response.id,
          cardNumber: data.cardNumber,
          lastFourDigits: response.last4Digits,
          cardType: cardBrand,
          expiryDate: data.expiryDate,
          cvv: data.cvv,
          cardholderName: response.cardholderName,
        });
      } else if (mode === "payment" && onSaveCard) {
        onSaveCard({
          id: response.id,
          cardType: cardBrand,
          lastFourDigits: response.last4Digits,
          expiryDate: data.expiryDate,
          cardholderName: response.cardholderName,
          isDefault: response.isDefault,
        });
      }
      handleClose();
    } catch (error) {
      const errMsg = getErrorMessage(error);
      setSubmitError(errMsg);
      console.error("Failed to add payment method to user profile:", error);

      const apiError = error as Partial<ApiError> | null;
      if (apiError?.errors) {
        console.error("Validation errors details:", JSON.stringify(apiError.errors, null, 2));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPayoutMode = mode === "payout";
  const shouldShowSavedCards =
    !showNewCardForm &&
    (isLoadingSavedPaymentMethods || isSavedPaymentMethodsError || savedPaymentMethods.length > 0);
  const shouldShowNewCardForm =
    showNewCardForm ||
    (!isLoadingSavedPaymentMethods &&
      !isSavedPaymentMethodsError &&
      savedPaymentMethods.length === 0);
  const formCancelHandler =
    savedPaymentMethods.length > 0
      ? () => {
          setShowNewCardForm(false);
          setSubmitError(null);
        }
      : handleClose;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[500px] bg-card border-l border-border p-6 flex flex-col justify-start overflow-y-auto z-[100]"
      >
        <div className="space-y-6 text-left">
          {/* Header */}
          <SheetHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold text-foreground">
                  {isPayoutMode ? "Add Payout Method (Secure)" : "Secure Checkout Payment"}
                </SheetTitle>
                <div className="flex items-center gap-1.5 text-indigo-500 font-bold text-[11px] mt-0.5">
                  <span className="text-muted-foreground font-semibold">Powered by</span>
                  <span className="tracking-tight text-xs font-extrabold uppercase text-[#635BFF]">Stripe</span>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Secure Info Banner */}
          <div className="flex items-start gap-3 bg-[#EAF1FC] dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-xs md:text-sm text-[#1A73E8] dark:text-blue-300">
            <Shield className="h-5 w-5 text-[#1A73E8] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">
              {isPayoutMode
                ? "Your payout information is handled securely by Stripe. MazadZone does not store your full card details."
                : "This checkout setup is handled by a third-party payment provider. MazadZone does not store your credit card details."}
            </p>
          </div>

          {/* Billing Address Selection (only for payment mode) */}
          {!isPayoutMode && deliveryAddress && (
            <div className="flex items-start gap-2 bg-muted/20 border border-border/50 rounded-xl p-4">
              <Checkbox
                id="billingSame"
                checked={billingSameAsDelivery}
                onCheckedChange={(checked) => setBillingSameAsDelivery(checked === true)}
                className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="billingSame"
                  className="text-sm font-bold text-foreground cursor-pointer select-none"
                >
                  Billing address same as shipping
                </Label>
                {billingSameAsDelivery ? (
                  <p className="text-xs text-muted-foreground leading-normal">
                    Using: {deliveryAddress.building}, {deliveryAddress.streetAddress}, {deliveryAddress.city}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground leading-normal">
                    You will be prompted to enter billing address details at confirmation.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Error Alert */}
          {submitError && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-xs md:text-sm text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Error Registering Card</p>
                <p className="leading-relaxed font-medium">{submitError}</p>
              </div>
            </div>
          )}

          {shouldShowSavedCards && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Saved payment methods</h4>
                <p className="text-xs text-muted-foreground">
                  {isPayoutMode
                    ? "Choose which saved card you want to use for seller payouts."
                    : "Choose which saved card you want to use for this payment."}
                </p>
              </div>

              {isLoadingSavedPaymentMethods ? (
                <div className="flex items-center justify-center rounded-xl border border-border bg-muted/10 py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading saved cards...
                </div>
              ) : isSavedPaymentMethodsError ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  We couldn&apos;t load your saved payment methods right now.
                </div>
              ) : (
                <RadioGroup value={selectedPaymentMethodId ?? ""} className="gap-3">
                  {savedPaymentMethods.map((paymentMethod) => {
                    const isSelected = paymentMethod.id === selectedPaymentMethodId;

                    return (
                      <div
                        key={paymentMethod.id}
                        onClick={() => handleUseSavedCard(paymentMethod)}
                        className={cn(
                          "cursor-pointer rounded-xl border p-4 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/10",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem
                            value={paymentMethod.id}
                            id={`payment-method-${paymentMethod.id}`}
                            className="mt-1 border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:text-primary"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor={`payment-method-${paymentMethod.id}`}
                                  className="cursor-pointer text-sm font-bold text-foreground"
                                >
                                  {paymentMethod.cardType === "UNKNOWN" ? "Card" : paymentMethod.cardType} •••• {paymentMethod.lastFourDigits}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {paymentMethod.cardholderName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Expires {paymentMethod.expiryDate}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {paymentMethod.isDefault && (
                                  <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                    Default
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="inline-flex items-center gap-1 rounded border border-emerald-200/60 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Selected
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-muted/25 px-3 py-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                <span>
                                  {isPayoutMode
                                    ? "Use this card as your seller payout method."
                                    : "Use this card for the current flow."}
                                </span>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant={isSelected ? "secondary" : "outline"}
                                className="h-8 cursor-pointer text-xs font-semibold"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleUseSavedCard(paymentMethod);
                                }}
                              >
                                {isSelected ? "Keep selected" : isPayoutMode ? "Use for payouts" : "Use this card"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer font-semibold"
                onClick={() => {
                  setShowNewCardForm(true);
                  setSubmitError(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isPayoutMode ? "Add another payout card" : "Add another card"}
              </Button>
              {isPayoutMode && (
                <div className="rounded-xl border border-border bg-muted/15 p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Important</p>
                  <p className="mt-1">
                    This payout method will be used to receive your earnings after a successful sale.
                  </p>
                </div>
              )}
            </div>
          )}

          {shouldShowNewCardForm && (
            <div className="pt-2">
              {!isPayoutMode && savedPaymentMethods.length > 0 && (
                <div className="mb-4 rounded-xl border border-border bg-muted/15 p-3 text-xs text-muted-foreground">
                  Add a new saved card without losing your existing ones.
                </div>
              )}
              <CreditCardForm
                onSave={handleFormSave}
                onCancel={formCancelHandler}
                isSubmitting={isSubmitting}
                mode={mode}
                authorizationAmount={amount}
                submitButtonText={isPayoutMode ? "Save Payout Method" : "Save Card"}
                infoBannerText={
                  isPayoutMode
                    ? undefined
                    : "Your card will be saved securely so you can choose it in future bidding and checkout flows."
                }
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
