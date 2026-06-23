import { Gavel, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "../auction-card/CountdownTimer";
import { InlineFacts, type FactItem } from "@/components/ui/inline-facts";
import { formatCurrency } from "@/utils/currency.utils";
import { cn } from "@/lib/utils";
import { AuctionStatus } from "../../types/auction.types";
import type { AuctionSummary } from "../../types/auction.types";

interface AuctionMainInfoProps {
  auction: AuctionSummary;
  onPlaceBid: () => void;
}

export function AuctionMainInfo({
  auction,
  onPlaceBid,
}: AuctionMainInfoProps) {
  const isUpcoming = auction.status === AuctionStatus.UPCOMING;
  const isEnded = auction.status === AuctionStatus.ENDED;
  const hasBids = auction.pricing.bidCount > 0 && auction.pricing.currentBid !== null;
  const displayPrice = auction.pricing.currentBid ?? auction.pricing.startingPrice;

  // Min increment directly fetched from the API data
  const minIncrement = auction.pricing.minimumIncrement ?? 10;

  const isMuted = isEnded;

  const facts: FactItem[] = [
    {
      label: hasBids ? "Current Bid" : "Start Price",
      value: formatCurrency(displayPrice),
      muted: isMuted,
    },
    {
      label: "Min. Increment",
      value: formatCurrency(minIncrement),
      muted: isEnded || isUpcoming,
    },
    {
      label: "Total Bids",
      value: String(auction.pricing.bidCount),
      muted: isMuted,
    },
  ];

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
    <div className="flex flex-col gap-5">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground break-words">
        {auction.title}
      </h1>

      {/* Countdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <CountdownTimer
          startDate={auction.timing.startDate}
          endDate={auction.timing.endDate}
          variant="large"
          status={auction.status}
          label={isUpcoming ? "UPCOMING IN" : undefined}
          auctionId={auction.id}
        />
      </div>

      {/* Inline Facts — replaces stat cards */}
      <InlineFacts facts={facts} />

      {/* Primary Action */}
      <Button
        onClick={onPlaceBid}
        disabled={((isUpcoming || isEnded) && !auction.isOwner) || auction.isOwner}
        className={cn(
          "h-12 w-full cursor-pointer rounded-[10px] bg-primary text-base font-bold tracking-wide text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
          isEnded && !auction.isOwner && "bg-muted text-muted-foreground hover:bg-muted opacity-100"
        )}
      >
        {getButtonContent()}
      </Button>
    </div>
  );
}
