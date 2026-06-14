"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { useGetSavedPaymentMethods } from "@/features/payment";
import { useGetAddresses, useGetProfile } from "@/features/profile";
import { cn } from "@/lib/utils";
import { useCompleteOrderPayment } from "../../api";
import type {
  CheckoutAddress,
  CheckoutPaymentMethod,
  CheckoutPaymentResponse,
} from "../../types/checkout.types";

import { AddressSelectStep } from "@/features/profile";
import { PaymentMethodDrawer } from "@/features/payment";

// Step components
import { OrderDetailsStep } from "./OrderDetailsStep";
import { ReviewPaymentStep } from "./ReviewPaymentStep";
import { PaymentSuccessStep } from "./PaymentSuccessStep";

export interface CompletePaymentModalProps {
  orderId: string;
  orderNumber: string;
  finalBid: number;
  title: string;
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const CompletePaymentModal = memo(function CompletePaymentModal({
  orderId,
  orderNumber,
  finalBid,
  title,
  imageUrl,
  isOpen,
  onClose,
  onPaymentSuccess,
}: CompletePaymentModalProps) {
  const { data: profileAddresses = [] } = useGetAddresses();
  const { data: savedPaymentMethods = [] } = useGetSavedPaymentMethods();
  const completePaymentMutation = useCompleteOrderPayment();
  const { data: profile } = useGetProfile();

  const depositAmount = finalBid * 0.1;
  const amountDue = finalBid * 0.9;

  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [step, setStep] = useState<"details" | "choose-address" | "review" | "success">("details");
  const [selectedAddressOverride, setSelectedAddressOverride] = useState<
    CheckoutAddress | null | undefined
  >(undefined);
  const [selectedPaymentOverride, setSelectedPaymentOverride] = useState<
    CheckoutPaymentMethod | null | undefined
  >(undefined);
  const [paymentResponse, setPaymentResponse] = useState<CheckoutPaymentResponse | null>(null);

  const defaultSelectedAddress = useMemo(() => {
    const defaultAddressSource =
      profileAddresses.find((address) => address.isDefault) || profileAddresses[0] || null;
    if (!defaultAddressSource) return null;
    return {
      id: defaultAddressSource.id,
      label: defaultAddressSource.title,
      fullName: profile?.fullName || "",
      phoneNumber: profile?.phoneNumber || "",
      streetAddress: defaultAddressSource.streetAddress,
      building: defaultAddressSource.building,
      city: defaultAddressSource.city,
      isDefault: defaultAddressSource.isDefault,
    };
  }, [profileAddresses, profile?.fullName, profile?.phoneNumber]);

  const defaultSelectedPayment = useMemo(() => {
    const defaultPaymentSource =
      savedPaymentMethods.find((paymentMethod) => paymentMethod.isDefault) ||
      savedPaymentMethods[0] ||
      null;
    if (!defaultPaymentSource) return null;
    return {
      id: defaultPaymentSource.id,
      cardType: defaultPaymentSource.cardType,
      lastFourDigits: defaultPaymentSource.lastFourDigits,
      expiryDate: defaultPaymentSource.expiryDate,
      cardholderName: defaultPaymentSource.cardholderName,
      isDefault: defaultPaymentSource.isDefault,
    };
  }, [savedPaymentMethods]);

  const selectedAddress =
    selectedAddressOverride === undefined
      ? defaultSelectedAddress
      : selectedAddressOverride;
  const selectedPayment =
    selectedPaymentOverride === undefined
      ? defaultSelectedPayment
      : selectedPaymentOverride;

  const handleClose = useCallback(() => {
    setStep("details");
    setSelectedAddressOverride(undefined);
    setSelectedPaymentOverride(undefined);
    setPaymentResponse(null);
    setIsPaymentSheetOpen(false);
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleClose();
    },
    [handleClose],
  );

  const handleSelectAddress = useCallback((address: CheckoutAddress) => {
    setSelectedAddressOverride(address);
    setStep("details");
  }, []);

  const handleSavePaymentMethod = useCallback((paymentMethod: CheckoutPaymentMethod) => {
    setSelectedPaymentOverride(paymentMethod);
    setIsPaymentSheetOpen(false);
  }, []);

  const handlePaymentSubmit = useCallback(async () => {
    if (!selectedAddress || !selectedPayment) return;

    try {
      const response = await completePaymentMutation.mutateAsync({
        orderId,
        addressId: selectedAddress.id,
        paymentMethodId: selectedPayment.id,
      });

      setPaymentResponse({
        ...response,
        deliveryAddress: selectedAddress,
        paymentMethod: selectedPayment,
      });
      setStep("success");
      onPaymentSuccess?.();
    } catch (err) {
      console.error("Failed to complete order payment:", err);
    }
  }, [selectedAddress, selectedPayment, completePaymentMutation, orderId, onPaymentSuccess]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "w-full bg-card border-border p-6 shadow-xl rounded-xl gap-0 z-50 focus-visible:outline-none transition-all duration-200 text-left",
            step === "details" ? "max-w-lg" : "max-w-md"
          )}
          showCloseButton={step !== "success"}
        >
          <VisuallyHidden.Root>
            <DialogTitle>Complete Order Payment Dialog</DialogTitle>
          </VisuallyHidden.Root>

          {/* Step 1: Details summary */}
          {step === "details" && (
            <OrderDetailsStep
              orderNumber={orderNumber}
              title={title}
              imageUrl={imageUrl}
              finalBid={finalBid}
              depositAmount={depositAmount}
              amountDue={amountDue}
              selectedAddress={selectedAddress}
              selectedPayment={selectedPayment}
              onChangeAddress={() => setStep("choose-address")}
              onAddPayment={() => setIsPaymentSheetOpen(true)}
              onContinue={() => setStep("review")}
              onCancel={handleClose}
            />
          )}

          {/* Step 2: Choose Address list */}
          {step === "choose-address" && (
            <AddressSelectStep
              selectedAddressId={selectedAddress?.id}
              onSelectAddress={handleSelectAddress}
              onCancel={() => setStep("details")}
              title="Choose Shipping Address"
              subtitle="Select where you want your item to be shipped."
            />
          )}

          {/* Step 4: Review and Pay */}
          {step === "review" && (
            <ReviewPaymentStep
              orderNumber={orderNumber}
              title={title}
              finalBid={finalBid}
              depositAmount={depositAmount}
              amountDue={amountDue}
              selectedAddress={selectedAddress}
              selectedPayment={selectedPayment}
              onConfirm={handlePaymentSubmit}
              onCancel={() => setStep("details")}
              isSubmitting={completePaymentMutation.isPending}
            />
          )}

          {/* Step 5: Success Receipt */}
          {step === "success" && (
            <PaymentSuccessStep
              paymentResponse={paymentResponse}
              onClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {isPaymentSheetOpen && (
      <PaymentMethodDrawer
        isOpen={isPaymentSheetOpen}
        onClose={() => setIsPaymentSheetOpen(false)}
        onSaveCard={handleSavePaymentMethod}
        selectedPaymentMethodId={selectedPayment?.id}
        mode="payment"
        amount={amountDue}
        deliveryAddress={selectedAddress}
      />
      )}
    </>
  );
});
