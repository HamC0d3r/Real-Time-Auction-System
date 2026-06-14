"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { useGetAddresses } from "@/features/profile";
import { useGetSavedPaymentMethods } from "@/features/payment";
import { cn } from "@/lib/utils";
import { usePlaceBid } from "../../api/bidding.queries";
import { useAppToast } from "@/lib/toast/app-toast";
import { useAuthStore } from "@/stores/auth.store";
import type {
  PlaceBidModalProps,
  DeliveryAddress,
  SavedPaymentMethod,
  PlaceBidResponse,
} from "../../types/place-bid.types";

import { PlaceBidStep } from "./PlaceBidStep";
import { ReviewConfirmStep } from "./ReviewConfirmStep";
import { BidSuccessStep } from "./BidSuccessStep";

const LazyAddressSelectStep = dynamic(
  () =>
    import("@/features/profile/components/AddressSelectStep").then(
      (module) => module.AddressSelectStep,
    ),
  { loading: () => <AddressSelectSkeleton /> },
);

const LazyPaymentMethodDrawer = dynamic(
  () =>
    import("@/features/payment/components/PaymentMethodDrawer").then(
      (module) => module.PaymentMethodDrawer,
    ),
  { loading: () => null },
);

function AddressSelectSkeleton() {
  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="h-6 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div key={item} className="h-24 rounded-xl border border-border bg-muted/20 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export const PlaceBidModal = memo(function PlaceBidModal({
  auctionId,
  auctionTitle,
  currentBid,
  minIncrement,
  isOpen,
  onClose,
}: PlaceBidModalProps) {
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [step, setStep] = useState<"place-bid" | "choose-address" | "review" | "success">("place-bid");
  const [bidAmountOverride, setBidAmountOverride] = useState<number | null>(null);
  const [selectedAddressOverride, setSelectedAddressOverride] = useState<
    DeliveryAddress | null | undefined
  >(undefined);
  const [selectedPaymentOverride, setSelectedPaymentOverride] = useState<
    SavedPaymentMethod | null | undefined
  >(undefined);
  const [bidResponse, setBidResponse] = useState<PlaceBidResponse | null>(null);

  const { data: profileAddresses = [] } = useGetAddresses({
    enabled: isOpen && step !== "success" && selectedAddressOverride === undefined,
  });
  const { data: savedPaymentMethods = [] } = useGetSavedPaymentMethods({
    enabled: isOpen && step !== "success" && selectedPaymentOverride === undefined,
  });
  const placeBidMutation = usePlaceBid();
  const user = useAuthStore((state) => state.user);
  const appToast = useAppToast();

  const defaultSelectedAddress = useMemo(() => {
    const defaultAddressSource =
      profileAddresses.find((address) => address.isDefault) || profileAddresses[0] || null;
    if (!defaultAddressSource) return null;
    return {
      id: defaultAddressSource.id,
      label: defaultAddressSource.title,
      fullName: user?.fullName || "",
      phoneNumber: "",
      streetAddress: defaultAddressSource.streetAddress,
      building: defaultAddressSource.building,
      city: defaultAddressSource.city,
      isDefault: defaultAddressSource.isDefault,
    };
  }, [profileAddresses, user?.fullName]);

  const defaultSelectedPayment = useMemo(() => {
    return (
      savedPaymentMethods.find((method) => method.isDefault) ||
      savedPaymentMethods[0] ||
      null
    );
  }, [savedPaymentMethods]);

  const selectedAddress =
    selectedAddressOverride === undefined
      ? defaultSelectedAddress
      : selectedAddressOverride;
  const selectedPayment =
    selectedPaymentOverride === undefined
      ? (defaultSelectedPayment as SavedPaymentMethod | null)
      : selectedPaymentOverride;
  const bidAmount = bidAmountOverride ?? currentBid + minIncrement;

  const handleClose = useCallback(() => {
    setStep("place-bid");
    setBidAmountOverride(null);
    setSelectedAddressOverride(undefined);
    setSelectedPaymentOverride(undefined);
    setBidResponse(null);
    setIsPaymentSheetOpen(false);
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleClose();
    },
    [handleClose],
  );

  const handleSelectAddress = useCallback((address: DeliveryAddress) => {
    setSelectedAddressOverride(address);
    setStep("place-bid");
  }, []);

  const handleSavePaymentMethod = useCallback((paymentMethod: SavedPaymentMethod) => {
    setSelectedPaymentOverride(paymentMethod);
    setIsPaymentSheetOpen(false);
  }, []);

  const goToChooseAddress = useCallback(() => setStep("choose-address"), []);
  const goToReview = useCallback(() => {
    if (!selectedAddress || !selectedPayment) return;
    setStep("review");
  }, [selectedAddress, selectedPayment]);
  const openPaymentSheet = useCallback(() => setIsPaymentSheetOpen(true), []);
  const goBackToPlaceBid = useCallback(() => setStep("place-bid"), []);
  const closePaymentSheet = useCallback(() => setIsPaymentSheetOpen(false), []);

  const handlePlaceBidSubmit = useCallback(async () => {
    if (!selectedAddress || !selectedPayment) return;

    try {
      const response = await placeBidMutation.mutateAsync({
        auctionId,
        bidAmount,
        addressId: selectedAddress.id,
        paymentMethodId: selectedPayment?.id,
      });

      setBidResponse(response);
      setStep("success");
      appToast.success("Bid Placed!", "Your bid has been placed successfully. Good luck!");
    } catch (err) {
      appToast.fromApiError(err, "Could not place your bid. Please try again.");
    }
  }, [selectedAddress, selectedPayment, placeBidMutation, auctionId, bidAmount, appToast]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "w-full bg-card border-border p-6 shadow-xl rounded-xl gap-0 z-50 focus-visible:outline-none transition-all duration-200",
            step === "place-bid" ? "sm:max-w-xl" : "sm:max-w-lg"
          )}
          showCloseButton={step !== "success"}
        >
          <VisuallyHidden.Root>
            <DialogTitle>Place Bid Dialog</DialogTitle>
            <DialogDescription>
              Configure and place a bid on the selected auction listing.
            </DialogDescription>
          </VisuallyHidden.Root>

          {step === "place-bid" && (
            <PlaceBidStep
              auctionTitle={auctionTitle}
              currentBid={currentBid}
              minIncrement={minIncrement}
              bidAmount={bidAmount}
              onBidAmountChange={setBidAmountOverride}
              selectedAddress={selectedAddress}
              selectedPayment={selectedPayment}
              onChangeAddress={goToChooseAddress}
              onAddPayment={openPaymentSheet}
              onContinue={goToReview}
              onCancel={handleClose}
            />
          )}

          {step === "choose-address" && (
            <LazyAddressSelectStep
              selectedAddressId={selectedAddress?.id}
              onSelectAddress={handleSelectAddress}
              onCancel={goBackToPlaceBid}
              title="Choose Delivery Address"
              subtitle="Select where you want your item to be delivered."
            />
          )}

          {step === "review" && (
            <ReviewConfirmStep
              auctionTitle={auctionTitle}
              bidAmount={bidAmount}
              currentBid={currentBid}
              minIncrement={minIncrement}
              selectedAddress={selectedAddress}
              selectedPayment={selectedPayment}
              onConfirm={handlePlaceBidSubmit}
              onCancel={goBackToPlaceBid}
              onChangeAddress={goToChooseAddress}
              onChangePayment={openPaymentSheet}
              isSubmitting={placeBidMutation.isPending}
            />
          )}

          {step === "success" && (
            <BidSuccessStep
              bidResponse={bidResponse}
              onViewAuction={handleClose}
              onClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {isPaymentSheetOpen && (
        <LazyPaymentMethodDrawer
          isOpen={isPaymentSheetOpen}
          onClose={closePaymentSheet}
          onSaveCard={handleSavePaymentMethod}
          selectedPaymentMethodId={selectedPayment?.id}
          mode="payment"
          amount={bidAmount * 0.1}
          deliveryAddress={selectedAddress}
        />
      )}
    </>
  );
});
