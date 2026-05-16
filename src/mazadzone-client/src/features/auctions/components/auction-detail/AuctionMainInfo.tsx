import { Heart, Share2, Gavel, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "../auction-card/CountdownTimer";
import { StatCard } from "./StatCard";
import { formatCurrency } from "@/utils/currency.utils";
import { cn } from "@/lib/utils";
import { AuctionStatus } from "../../types/auction.types";
import type { AuctionSummary } from "../../types/auction.types";

interface AuctionMainInfoProps {
  auction: AuctionSummary;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onPlaceBid: () => void;
  onShare: () => void;
}

export function AuctionMainInfo({
  auction,
  isFavorite,
  onFavoriteToggle,
  onPlaceBid,
  onShare,
}: AuctionMainInfoProps) {
  const isUpcoming = auction.status === AuctionStatus.UPCOMING;
  const isEnded = auction.status === AuctionStatus.ENDED;
  const hasBids = auction.pricing.bidCount > 0 && auction.pricing.currentBid !== null;
  const displayPrice = auction.pricing.currentBid ?? auction.pricing.startingPrice;

  // Min increment only relevant when bidding is possible
  const minIncrement =
    displayPrice < 100 ? 5 :
      displayPrice < 1000 ? 50 :
        displayPrice < 10000 ? 100 : 250;

  const getButtonContent = () => {
    if (auction.isOwner) {
      return (
        <>
          <Edit2 className="mr-2 size-4" aria-hidden="true" />
          Edit Auction
        </>
      );
    }
    if (isEnded) {
      return "Auction Ended";
    }
    if (isUpcoming) {
      return "Auction Not Started";
    }
    return (
      <>
        <Gavel className="mr-2 size-5" aria-hidden="true" />
        Place Bid
      </>
    );
  };

  return (
    <div className="flex flex-col gap-[26px]">
      {/* Title */}
      <h1 className="text-4xl font-bold leading-tight text-foreground">
        {auction.title}
      </h1>

      {/* Countdown — label changes for upcoming vs active */}
      <div className="rounded-xl border border-border bg-card p-4">
        <CountdownTimer
          startDate={auction.timing.startDate}
          endDate={auction.timing.endDate}
          variant="large"
          status={auction.status}
          label={isUpcoming ? "UPCOMING IN" : undefined}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label={hasBids ? "Current Bid" : "Start Price"}
          value={formatCurrency(displayPrice)}
          className={cn(isEnded && "opacity-60")}
        />
        <StatCard
          label="Min. Increment"
          value={formatCurrency(minIncrement)}
          className={cn((isEnded || isUpcoming) && "opacity-60")}
        />
        <StatCard
          label="Total Bids"
          value={String(auction.pricing.bidCount)}
          className={cn(isEnded && "opacity-60")}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onPlaceBid}
          disabled={(isUpcoming || isEnded) && !auction.isOwner}
          className={cn(
            "h-12 flex-1 cursor-pointer rounded-[10px] bg-primary text-base font-bold tracking-wide text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50",
            isEnded && !auction.isOwner && "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed opacity-100"
          )}
        >
          {getButtonContent()}
        </Button>

        <button
          onClick={onFavoriteToggle}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          className={cn(
            "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-2 border-border/80 transition-all hover:border-primary",
            isFavorite && "border-primary bg-primary/5"
          )}
        >
          <Heart
            className={cn(
              "size-5 transition-colors",
              isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
            )}
            strokeWidth={2.5}
          />
        </button>

        <button
          onClick={onShare}
          aria-label="Share this auction"
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-2 border-border/80 transition-all hover:border-primary"
        >
          <Share2 className="size-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
