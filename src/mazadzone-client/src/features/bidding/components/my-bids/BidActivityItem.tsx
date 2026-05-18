"use client";

import { BidActivity } from "../../types/bidding.types";
import { formatCurrency } from "@/utils/currency.utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { BidStatusBadge } from "./BidStatusBadge";
import {
  ActivityListItem,
  ActivityItemImage,
  ActivityItemMeta,
  ActivityItemActions,
} from "@/components/activity-list";

interface BidActivityItemProps {
  activity: BidActivity;
}

export function BidActivityItem({ activity }: BidActivityItemProps) {
  const isEnded = activity.status === "Ended";
  const isOutbid = activity.status === "Outbid";
  const detailHref = ROUTES.AUCTIONS.DETAIL(activity.auction.id);
  const currentBid = activity.auction.pricing.currentBid || activity.auction.pricing.startingPrice;

  return (
    <ActivityListItem>
      {/* 1. Left section: Image and Details */}
      <div className="flex items-center gap-4 w-full md:w-[35%] shrink-0">
        <ActivityItemImage
          src={activity.auction.imageUrl}
          alt={activity.auction.title}
          href={detailHref}
        />
        <ActivityItemMeta
          title={activity.auction.title}
          titleHref={detailHref}
          subtitle={
            <>
              <span>
                Your Bid: <span className="font-medium text-gray-700">{formatCurrency(activity.yourBid)}</span>
              </span>
              <span>
                Current Bid: <span className="font-medium text-gray-700">{formatCurrency(currentBid)}</span>
              </span>
            </>
          }
        />
      </div>

      {/* 2. Middle: Status Badge */}
      <div className="flex justify-center w-full md:w-auto md:flex-1">
        <BidStatusBadge status={activity.status} />
      </div>

      {/* 3. Time Left */}
      <div className="flex justify-center items-center w-full md:w-auto md:flex-1">
        <CountdownTimer
          endDate={activity.auction.timing.endDate}
          variant="minimal"
          status={activity.status}
          className="text-gray-600 font-medium"
        />
      </div>

      {/* 4. Right: CTA Button */}
      <ActivityItemActions>
        <Button
          asChild
          variant={isOutbid ? "default" : "secondary"}
          className={cn(
            "font-semibold rounded-xl text-lg w-52 h-14 cursor-pointer transition-colors",
            isOutbid
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
          )}
        >
          <Link href={detailHref}>
            {isEnded ? "View Details" : isOutbid ? "Place New Bid" : "View Auction"}
          </Link>
        </Button>
      </ActivityItemActions>
    </ActivityListItem>
  );
}
