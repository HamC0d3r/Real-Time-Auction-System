"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, CircleDollarSign } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";
import { formatCurrency } from "@/utils/currency.utils";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "./CountdownTimer";
import { getAuctionImageFallback } from "../../utils/image.utils";
import type { AuctionCardProps } from "../../types/auction.types";

const AuctionCardComponent = ({
  auction,
  priority = false,
  className,
  actionSlot,
}: AuctionCardProps) => {
  const { id, title, imageUrl, pricing, timing, status, condition } = auction;
  const isUpcoming = status === "Upcoming";
  const isEnded = status === "Ended";
  const displayPrice = pricing.currentBid ?? pricing.startingPrice;
  const auctionDetailsHref = ROUTES.AUCTIONS.DETAIL(id);
  const fallbackImageUrl = getAuctionImageFallback(title, 800, 600);

  return (
    <article
      className={cn(
        "flex min-h-[416px] w-full min-w-[280px] xs:min-w-[311px] flex-col rounded-[12px] border border-border bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <div className="relative h-[200px] w-full overflow-hidden rounded-[8px] bg-muted">
        <Badge
          className={cn(
            "absolute right-3 top-3 z-10 font-bold px-2.5 py-1 text-[10px] uppercase shadow-sm select-none border-none",
            status === "Active" && "bg-success text-success-foreground",
            status === "Upcoming" && "bg-upcoming text-upcoming-foreground",
            status === "Ended" && "bg-muted text-muted-foreground",
          )}
        >
          {status}
        </Badge>
        <Link
          href={auctionDetailsHref}
          className="group block h-full w-full"
          aria-label={`View details for ${title}`}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1280px) 311px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
            onError={(event) => {
              event.currentTarget.src = fallbackImageUrl;
              event.currentTarget.srcset = fallbackImageUrl;
            }}
          />
        </Link>
      </div>

      <Link href={auctionDetailsHref} className="mt-3 block">
        <h3
          className="line-clamp-2 text-xl font-bold leading-tight text-foreground hover:text-primary"
          title={title}
        >
          {title}
        </h3>
      </Link>

      <div >
        <div className="flex justify-end mb-1">
          <Badge
            variant="default"
            className="h-5 text-[9px] px-1.5 font-bold uppercase tracking-wider select-none"
          >
            {condition}
          </Badge>
        </div>
        <div>
          <CountdownTimer
            startDate={timing.startDate}
            endDate={timing.endDate}
            status={status}
            label={isUpcoming ? "UPCOMING IN" : undefined}
            auctionId={id}
          />
        </div>


        <div className="my-2.5 h-px w-full bg-border" aria-hidden="true" />

        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <CircleDollarSign
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-muted-foreground">
                {isUpcoming ? "Starting Price:" : pricing.bidCount > 0 ? "Current Bid:" : "Start Price:"}
              </span>
            </div>

            <span className={cn(
              isUpcoming ? "text-lg font-bold text-foreground/90" : "text-xl font-extrabold text-primary",
              isEnded && "text-muted-foreground"
            )}>
              {formatCurrency(isUpcoming ? pricing.startingPrice : displayPrice)}
            </span>
          </div>

          {!isUpcoming && (
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1">
                <Users
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-xs font-bold text-foreground">
                  {pricing.bidCount} {pricing.bidCount === 1 ? "BID" : "BIDS"}
                </span>
              </div>

              <Link
                href={auctionDetailsHref}
                className="text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                View Bidders &rsaquo;
              </Link>
            </div>
          )}
        </div>


        {actionSlot}
      </div>
    </article >
  );
};

export const AuctionCard = memo(AuctionCardComponent);
