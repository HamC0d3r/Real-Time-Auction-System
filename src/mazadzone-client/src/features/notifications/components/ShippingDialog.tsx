"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { Truck, Sparkles, MapPin, Package, Check } from "lucide-react";
import { formatCurrency } from "@/utils/currency.utils";
import { useGetOrderDetails } from "@/features/orders/api/order.queries";
import { useShippingDialogStore } from "../store/shipping-dialog.store";
import { cn } from "@/lib/utils";
import type { ShippingDialogData } from "../store/shipping-dialog.store";

// ---------------------------------------------------------------------------
// Main Shipping Dialog Component Wrapper
// ---------------------------------------------------------------------------
export const ShippingDialog = memo(function ShippingDialog() {
  const { isOpen, data, closeShippingDialog } = useShippingDialogStore();

  if (!isOpen || !data) return null;

  return (
    <ShippingDialogContent
      isOpen={isOpen}
      data={data}
      closeShippingDialog={closeShippingDialog}
    />
  );
});

// ---------------------------------------------------------------------------
// Internal content component (unmounted when closed)
// ---------------------------------------------------------------------------
const ShippingDialogContent = memo(function ShippingDialogContent({
  isOpen,
  data,
  closeShippingDialog,
}: {
  isOpen: boolean;
  data: ShippingDialogData;
  closeShippingDialog: () => void;
}) {
  const { data: orderDetails, isLoading } = useGetOrderDetails(data.orderId, { enabled: isOpen });
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
      if (!open) closeShippingDialog();
    },
    [closeShippingDialog],
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-md bg-card border border-border p-6 shadow-2xl rounded-2xl gap-0 z-[100] focus-visible:outline-none overflow-hidden duration-300 ease-out"
          showCloseButton={true}
        >
          {/* Custom animations for premium experience */}
          <style>{`
            @keyframes truckVibrate {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              25% { transform: translateY(-1.5px) rotate(0.5deg); }
              75% { transform: translateY(1px) rotate(-0.5deg); }
            }
            @keyframes roadMove {
              0% { transform: translateX(0); }
              100% { transform: translateX(-40px); }
            }
            .animate-truck {
              animation: truckVibrate 0.18s linear infinite;
            }
            .animate-road {
              animation: roadMove 1s linear infinite;
            }
          `}</style>

          <VisuallyHidden.Root>
            <DialogTitle>Order Shipped Celebration Dialog</DialogTitle>
          </VisuallyHidden.Root>

          <div className="w-full flex flex-col items-center text-center relative z-10 pt-8">
            {/* Animated Truck & Delivery Scene */}
            <div className="relative w-full flex flex-col items-center justify-center py-4 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl mb-4 overflow-hidden border border-primary/10">
              <div className="absolute top-2 right-4 flex gap-1 opacity-70">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              </div>
              
              {/* Truck wrapper with engine vibration */}
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                <Truck className={cn("h-10 w-10 text-primary", isFullyOpen && "animate-truck")} />
              </div>

              {/* Moving road dash line under the truck */}
              <div className="relative w-24 h-1 mt-3 overflow-hidden rounded-full bg-muted">
                <div className={cn("absolute inset-0 flex gap-2 w-[200%]", isFullyOpen && "animate-road")}>
                  {[...Array(8)].map((_, i) => (
                    <span key={i} className="h-full w-4 bg-primary/40 shrink-0 rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Your Order is on the Way! 🚚
            </h2>
            <p className="mt-1.5 text-sm font-semibold text-foreground">
              Great news! Your item has been shipped.
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-relaxed">
              The seller has sent your item. It is currently in transit to your delivery address.
            </p>

            {/* Premium Shipping Timeline */}
            <div className="w-full mt-5 px-2">
              <div className="flex justify-between items-center relative">
                {/* Background Progress Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-muted z-0">
                  <div className="h-full bg-primary w-2/3 transition-all duration-500" />
                </div>

                {/* Timeline Step 1: Placed */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-card shadow-xs">
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1.5">Placed</span>
                </div>

                {/* Timeline Step 2: Paid */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-card shadow-xs">
                    <Check className="h-3 w-3 stroke-[3px]" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1.5">Paid</span>
                </div>

                {/* Timeline Step 3: Shipped (Current) */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-primary animate-pulse shadow-sm">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <span className="text-[10px] font-extrabold text-primary mt-1.5">Shipped</span>
                </div>

                {/* Timeline Step 4: Delivered */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center border-2 border-card shadow-xs">
                    <Package className="h-3 w-3" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1.5">Delivered</span>
                </div>
              </div>
            </div>

            {/* Shipped Item Block */}
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
                    <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center border border-border/50 shrink-0">
                      <Package className="h-6 w-6 text-primary" />
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
