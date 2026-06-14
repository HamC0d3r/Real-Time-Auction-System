"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/currency.utils";
import { useGetAuctionById } from "@/features/auctions";
import { useWinDialogStore } from "../store/win-dialog.store";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import type { WinDialogData } from "../store/win-dialog.store";

// ---------------------------------------------------------------------------
// Main Win Celebration Dialog Component Wrapper
// ---------------------------------------------------------------------------
export const WinDialog = memo(function WinDialog() {
  const { isOpen, data, closeWinDialog } = useWinDialogStore();

  if (!isOpen || !data) return null;

  return (
    <WinDialogContent
      isOpen={isOpen}
      data={data}
      closeWinDialog={closeWinDialog}
    />
  );
});

// ---------------------------------------------------------------------------
// Internal content component (unmounted when closed)
// ---------------------------------------------------------------------------
const WinDialogContent = memo(function WinDialogContent({
  isOpen,
  data,
  closeWinDialog,
}: {
  isOpen: boolean;
  data: WinDialogData;
  closeWinDialog: () => void;
}) {
  const router = useRouter();
  const { data: auction } = useGetAuctionById(data.auctionId);
  const [isFullyOpen, setIsFullyOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsFullyOpen(true), 250);
      return () => clearTimeout(timer);
    } else {
      setIsFullyOpen(false);
    }
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeWinDialog();
    },
    [closeWinDialog],
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-md bg-card border border-border p-6 shadow-2xl rounded-2xl gap-0 z-[100] focus-visible:outline-none overflow-hidden duration-300 ease-out"
          showCloseButton={true}
        >
          <style>{`
            @keyframes smoothFloat {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            .animate-float {
              animation: smoothFloat 3s ease-in-out infinite;
            }
          `}</style>

          <VisuallyHidden.Root>
            <DialogTitle>Auction Won Celebration Dialog</DialogTitle>
          </VisuallyHidden.Root>

          <div className="w-full flex flex-col items-center text-center relative z-10 pt-8">
            {/* Pulsing trophy wrapper */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-primary/30 opacity-40 blur-md animate-pulse" />
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent text-primary shadow-md shadow-primary/20 md:h-24 md:w-24">
                <Trophy className={cn("h-10 w-10 md:h-12 md:w-12", isFullyOpen && "animate-float")} />
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Congratulations! 🎉
            </h2>
            <p className="mt-1 text-base font-semibold text-foreground">
              You won the auction!
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-xs leading-relaxed">
              You had the winning bid. Secure your item by completing the payment now.
            </p>

            {/* Won Item Info block */}
            <div className="w-full mt-5 rounded-2xl border border-border bg-muted/30 p-4 flex gap-4 items-center text-left">
              {auction?.imageUrl ? (
                <img
                  src={auction.imageUrl}
                  alt={data.title}
                  className="h-14 w-14 rounded-xl object-cover border border-border/50 shadow-xs"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center border border-border/50 shrink-0">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">
                  {auction?.title || data.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Winning Bid:{" "}
                  <span className="font-extrabold text-primary text-sm">
                    {formatCurrency(data.bidAmount)}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions area */}
            <div className="w-full mt-6 space-y-3">
              {/* Action button */}
              <Button
                type="button"
                onClick={() => {
                  closeWinDialog();
                  router.push(ROUTES.ORDERS.LIST);
                }}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.01] transition-[transform,background-color] duration-200 ease-out"
              >
                <CreditCard className="h-5 w-5" />
                Complete Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
