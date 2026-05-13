"use client";

import { useRouter } from "next/navigation";
import { Gavel } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/components/ui/button";

interface PlaceBidButtonProps {
  auctionId: string;
  isOwner: boolean;
  className?: string;
}

/**
 * Place Bid CTA button with auth-aware routing:
 *
 * - If the user is NOT authenticated → navigate to register page
 * - If the user IS the auction owner (via prop) → show "View Auction" text
 * - Otherwise → navigate to auction detail page to place a bid
 */
export function PlaceBidButton({
  auctionId,
  isOwner,
  className,
}: PlaceBidButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(ROUTES.AUTH.REGISTER);
      return;
    }
    router.push(ROUTES.AUCTIONS.DETAIL(auctionId));
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "h-[48px] w-full cursor-pointer rounded-[10px] bg-primary text-base font-bold tracking-wide text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]",
        className,
      )}
      aria-label={isOwner ? "View your auction" : "Place a bid on this auction"}
    >
      {!isOwner && <Gavel className="mr-2 size-5" aria-hidden="true" />}
      {isOwner ? "VIEW AUCTION" : "PLACE BID"}
    </Button>
  );
}
