"use client";

import { BidActivity } from "../../types/bidding.types";
import { formatCurrency } from "@/utils/currency.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { CountdownTimer } from "@/components/ui/CountdownTimer";

interface BidActivityRowProps {
  activity: BidActivity;
}

export function BidActivityRow({ activity }: BidActivityRowProps) {
  // Determine styles and labels based on status
  const isEnded = activity.status === "Ended";
  const isLeading = activity.status === "Leading";
  const isOutbid = activity.status === "Outbid";
  const detailHref = ROUTES.AUCTIONS.DETAIL(activity.auction.id);
  const currentBid = activity.auction.pricing.currentBid || activity.auction.pricing.startingPrice;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
      {/* 1. Left section: Image and Details */}
      <div className="flex items-center gap-4 w-full md:w-[35%] shrink-0">
        <Link href={detailHref} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border border-gray-100 hover:opacity-90 transition-opacity cursor-pointer">
          <Image
            src={activity.auction.imageUrl}
            alt={activity.auction.title}
            fill
            className="object-cover"
          />
        </Link>
        <div className="flex flex-col">
          <Link href={detailHref} className="hover:text-primary transition-colors text-lg md:text-xl font-semibold text-gray-900 line-clamp-1 mb-2">
            {activity.auction.title}
          </Link>
          <div className="flex items-center gap-4 text-md text-gray-500">
            <span>Your Bid: <span className="font-medium text-gray-700">{formatCurrency(activity.yourBid)}</span></span>
            <span>Current Bid: <span className="font-medium text-gray-700">{formatCurrency(currentBid)}</span></span>
          </div>
        </div>
      </div>

      {/* 2. Middle: Status Badge */}
      <div className="flex justify-center w-full md:w-auto md:flex-1">
        <Badge
          variant="outline"
          className={cn(
            "rounded-full font-medium border-none w-24 h-8  text-lg flex items-center justify-center shrink-0",
            isEnded && "bg-gray-100 text-gray-600",
            isLeading && "bg-green-100 text-green-700",
            isOutbid && "bg-red-100 text-red-600"
          )}
        >
          {activity.status}
        </Badge>
      </div>

      {/* 3. Time Left (using shared CountdownTimer in minimal mode) */}
      <div className="flex justify-center items-center w-full md:w-auto md:flex-1">
        <CountdownTimer
          endDate={activity.auction.timing.endDate}
          variant="minimal"
          status={activity.status}
          className="text-gray-600 font-medium"
        />
      </div>

      {/* 4. Right: CTA Button */}
      <div className="flex justify-end w-full md:w-auto shrink-0">
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
      </div>
    </div>
  );
}
