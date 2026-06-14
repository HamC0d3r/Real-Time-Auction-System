"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Check, Star, Package, Sparkles } from "lucide-react";
import { formatCurrency } from "@/utils/currency.utils";
import { useGetOrderDetails } from "@/features/orders/api/order.queries";
import { SubmitSellerReviewDialog } from "@/features/orders";
import { useDeliveredDialogStore } from "../store/delivered-dialog.store";
import { cn } from "@/lib/utils";
import type { DeliveredDialogData } from "../store/delivered-dialog.store";

// ---------------------------------------------------------------------------
// Main Delivered Dialog Component Wrapper
// ---------------------------------------------------------------------------
export const DeliveredDialog = memo(function DeliveredDialog() {
  const {
    isOpen,
    isReviewOpen,
    data,
    closeDeliveredDialog,
    openReview,
    closeReview,
  } = useDeliveredDialogStore();

  if (!data) return null;

  return (
    <DeliveredDialogContent
      isOpen={isOpen}
      isReviewOpen={isReviewOpen}
      data={data}
      closeDeliveredDialog={closeDeliveredDialog}
      openReview={openReview}
      closeReview={closeReview}
    />
  );
});

// ---------------------------------------------------------------------------
// Internal content component (unmounted when closed/no data)
// ---------------------------------------------------------------------------
const DeliveredDialogContent = memo(function DeliveredDialogContent({
  isOpen,
  isReviewOpen,
  data,
  closeDeliveredDialog,
  openReview,
  closeReview,
}: {
  isOpen: boolean;
  isReviewOpen: boolean;
  data: DeliveredDialogData;
  closeDeliveredDialog: () => void;
  openReview: () => void;
  closeReview: () => void;
}) {
  const { data: orderDetails, isLoading } = useGetOrderDetails(data.orderId, {
    enabled: isOpen || isReviewOpen,
  });

  const [isFullyOpen, setIsFullyOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsFullyOpen(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsFullyOpen(false);
    }
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeDeliveredDialog();
    },
    [closeDeliveredDialog],
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-md bg-card border border-border p-6 shadow-2xl rounded-2xl gap-0 z-[100] focus-visible:outline-none overflow-hidden duration-300 ease-out"
          showCloseButton={true}
        >
          {/* Custom CSS Package Animations */}
          <style>{`
            @keyframes bouncePop {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
            .animate-bounce-pop {
              animation: bouncePop 2s ease-in-out infinite;
            }
          `}</style>

          <VisuallyHidden.Root>
            <DialogTitle>Order Delivered Celebration Dialog</DialogTitle>
          </VisuallyHidden.Root>

          <div className="w-full flex flex-col items-center text-center relative z-10 pt-8">
            {/* Celebration Package Icon */}
            <div className="relative w-full flex flex-col items-center justify-center py-4 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-2xl mb-4 overflow-hidden border border-emerald-500/20">
              <div className="absolute top-2 right-4 flex gap-1 opacity-70">
                <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
              </div>
              
              <div className={cn("relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shadow-inner", isFullyOpen && "animate-bounce-pop")}>
                <Package className="h-10 w-10 text-emerald-600" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-card shadow-sm">
                  <Check className="h-3 w-3 stroke-[3.5px]" />
                </div>
              </div>
            </div>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Item Delivered! 🎉
            </h2>
            <p className="mt-1.5 text-sm font-semibold text-foreground">
              Your auction package has successfully arrived!
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-relaxed">
              We hope you love your new item. Please take a moment to submit a review for the seller.
            </p>

            {/* Premium Delivery Timeline */}
            <div className="w-full mt-5 px-2">
              <div className="flex justify-between items-center relative">
                {/* Background Progress Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-muted z-0">
                  <div className="h-full bg-emerald-600 w-full transition-all duration-500" />
                </div>

                {/* Timeline Step 1: Placed */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-card shadow-xs">
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1.5">Placed</span>
                </div>

                {/* Timeline Step 2: Paid */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-card shadow-xs">
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1.5">Paid</span>
                </div>

                {/* Timeline Step 3: Shipped */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-card shadow-xs">
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1.5">Shipped</span>
                </div>

                {/* Timeline Step 4: Delivered (Current) */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-emerald-600 shadow-sm">
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 mt-1.5">Delivered</span>
                </div>
              </div>
            </div>

            {/* Delivered Item Block */}
            <div className="w-full mt-6 rounded-2xl border border-border bg-muted/30 p-4 text-left">
              {isLoading ? (
                <div className="flex gap-4 items-center animate-pulse">
                  <div className="h-14 w-14 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 items-center">
                  {orderDetails?.auction?.imageUrl ? (
                    <img
                      src={orderDetails.auction.imageUrl}
                      alt={orderDetails.auction.title || data.title}
                      className="h-14 w-14 rounded-xl object-cover border border-border/50 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center border border-border/50 shrink-0">
                      <Package className="h-6 w-6 text-emerald-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">
                      {orderDetails?.auction?.title || data.title}
                    </h4>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[11px] text-muted-foreground">
                        Winning Bid:{" "}
                        <span className="font-bold text-primary">
                          {formatCurrency(orderDetails?.finalBid || 0)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions area */}
            <div className="w-full mt-6 space-y-3">
              <Button
                type="button"
                onClick={openReview}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.01] transition-[transform,background-color] duration-200 ease-out"
              >
                <Star className="h-4 w-4 fill-white" />
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {orderDetails && (
        <SubmitSellerReviewDialog
          isOpen={isReviewOpen}
          onClose={closeReview}
          orderId={orderDetails.id}
          orderNumber={orderDetails.orderNumber}
          sellerId={orderDetails.sellerId || ""}
          sellerName={orderDetails.sellerName || "Seller"}
          itemName={orderDetails.auction?.title || data.title}
        />
      )}
    </>
  );
});
