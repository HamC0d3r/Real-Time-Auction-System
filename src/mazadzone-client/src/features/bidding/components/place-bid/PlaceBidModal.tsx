"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { useGetAddresses, useGetProfile } from "@/features/profile";
import { useGetSavedPaymentMethods } from "@/features/payment";
import { cn } from "@/lib/utils";
import { usePlaceBid } from "../../api/bidding.queries";
import { useAppToast } from "@/lib/toast/app-toast";
import type {
  PlaceBidModalProps,
  DeliveryAddress,
  SavedPaymentMethod,
  PlaceBidResponse,
} from "../../types/place-bid.types";

import { AddressSelectStep } from "@/features/profile";
import { PaymentMethodDrawer } from "@/features/payment";

// Step components
import { PlaceBidStep } from "./PlaceBidStep";
import { ReviewConfirmStep } from "./ReviewConfirmStep";
import { BidSuccessStep } from "./BidSuccessStep";

export function PlaceBidModal({
  auctionId,
  auctionTitle,
  currentBid,
  minIncrement,
  isOpen,
  onClose,
}: PlaceBidModalProps) {
  const { data: profileAddresses = [] } = useGetAddresses();
  const { data: savedPaymentMethods = [] } = useGetSavedPaymentMethods();
  const placeBidMutation = usePlaceBid();
  const { data: profile } = useGetProfile();
  const appToast = useAppToast();

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

  const defaultAddressSource =
    profileAddresses.find((address) => address.isDefault) || profileAddresses[0] || null;
  const defaultSelectedAddress: DeliveryAddress | null = defaultAddressSource
    ? {
        id: defaultAddressSource.id,
        label: defaultAddressSource.title,
        fullName: profile?.fullName || "",
        phoneNumber: profile?.phoneNumber || "",
        streetAddress: defaultAddressSource.streetAddress,
        building: defaultAddressSource.building,
        city: defaultAddressSource.city,
        isDefault: defaultAddressSource.isDefault,
      }
    : null;

  const defaultSelectedPayment =
    savedPaymentMethods.find((paymentMethod) => paymentMethod.isDefault) ||
    savedPaymentMethods[0] ||
    null;

  const selectedAddress =
    selectedAddressOverride === undefined
      ? defaultSelectedAddress
      : selectedAddressOverride;
  const selectedPayment =
    selectedPaymentOverride === undefined
      ? defaultSelectedPayment
      : selectedPaymentOverride;
  const bidAmount = bidAmountOverride ?? currentBid + minIncrement;

  const handleClose = () => {
    setStep("place-bid");
    setBidAmountOverride(null);
    setSelectedAddressOverride(undefined);
    setSelectedPaymentOverride(undefined);
    setBidResponse(null);
    setIsPaymentSheetOpen(false);
    onClose();
  };

  const handleSelectAddress = (address: DeliveryAddress) => {
    setSelectedAddressOverride(address);
    setStep("place-bid");
  };

  const handleSavePaymentMethod = (paymentMethod: SavedPaymentMethod) => {
    setSelectedPaymentOverride(paymentMethod);
    setIsPaymentSheetOpen(false);
  };

  const handlePlaceBidSubmit = async () => {
    if (!selectedAddress) return;

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
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
          {/* Step 1: Place Bid Form */}
          {step === "place-bid" && (
            <PlaceBidStep
              auctionTitle={auctionTitle}
              currentBid={currentBid}
              minIncrement={minIncrement}
              bidAmount={bidAmount}
              onBidAmountChange={setBidAmountOverride}
              selectedAddress={selectedAddress}
              selectedPayment={selectedPayment}
              onChangeAddress={() => setStep("choose-address")}
              onAddPayment={() => setIsPaymentSheetOpen(true)}
              onContinue={() => setStep("review")}
              onCancel={handleClose}
            />
          )}

          {/* Step 2: Choose Address List */}
          {step === "choose-address" && (
            <AddressSelectStep
              selectedAddressId={selectedAddress?.id}
              onSelectAddress={handleSelectAddress}
              onCancel={() => setStep("place-bid")}
              title="Choose Delivery Address"
              subtitle="Select where you want your item to be delivered."
            />
          )}

          {/* Step 4: Review and Confirm Details */}
          {step === "review" && (
            <ReviewConfirmStep
              auctionTitle={auctionTitle}
              bidAmount={bidAmount}
              currentBid={currentBid}
              minIncrement={minIncrement}
              selectedAddress={selectedAddress}
              selectedPayment={selectedPayment}
              onConfirm={handlePlaceBidSubmit}
              onCancel={() => setStep("place-bid")}
              onChangeAddress={() => setStep("choose-address")}
              onChangePayment={() => setIsPaymentSheetOpen(true)}
              isSubmitting={placeBidMutation.isPending}
            />
          )}

          {/* Step 5: Bid Success */}
          {step === "success" && (
            <BidSuccessStep
              bidResponse={bidResponse}
              onViewAuction={handleClose}
              onClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Step 3: Payment Sheet overlay on the right side */}
      <PaymentMethodDrawer
        isOpen={isPaymentSheetOpen}
        onClose={() => setIsPaymentSheetOpen(false)}
        onSaveCard={handleSavePaymentMethod}
        selectedPaymentMethodId={selectedPayment?.id}
        mode="payment"
        amount={bidAmount * 0.1}
        deliveryAddress={selectedAddress}
      />
    </>
  );
}
