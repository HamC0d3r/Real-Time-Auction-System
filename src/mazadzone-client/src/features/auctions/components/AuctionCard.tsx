"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Users, CircleDollarSign } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";
import { formatCurrency } from "@/utils/currency.utils";
import { CountdownTimer } from "./CountdownTimer";
import { PlaceBidButton } from "@/features/bidding";
import type { AuctionCardProps } from "../types/auction.types";

export function AuctionCard({
  auction,
  onFavoriteClick,
  priority = false,
  className,
}: AuctionCardProps) {
  const { id, title, imageUrl, pricing, timing, isFavorite, isOwner } = auction;
  const displayPrice = pricing.currentBid ?? pricing.startingPrice;
  const auctionDetailsHref = ROUTES.AUCTIONS.DETAIL(id);

  return (
    <article
      className={cn(
        "flex min-h-[416px] w-full min-w-[311px] flex-col rounded-[12px] border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative h-[200px] w-full overflow-hidden rounded-[8px] bg-muted">
        <Link
          href={auctionDetailsHref}
          className="group block h-full w-full"
          aria-label={`View details for ${title}`}
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="311px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        </Link>

        <button
          type="button"
          onClick={() => onFavoriteClick(id)}
          className={cn(
            "absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full transition-all",
            isFavorite
              ? "bg-primary text-primary-foreground"
              : "bg-foreground/60 text-white hover:bg-foreground/80",
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
        >
          <Heart
            className={cn("size-5", isFavorite && "fill-current")}
            strokeWidth={2}
          />
        </button>
      </div>

      <Link href={auctionDetailsHref} className="mt-3 block">
        <h3
          className="line-clamp-2 text-xl font-bold leading-tight text-foreground hover:text-primary"
          title={title}
        >
          {title}
        </h3>
      </Link>

      <div className="mt-auto pt-3">
        <div className="mt-2">
          <CountdownTimer endDate={timing.endDate} />
        </div>


        <div className="my-2.5 h-px w-full bg-border" aria-hidden="true" />

        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <CircleDollarSign
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-foreground">
                Current Bid:
              </span>
            </div>

            <span className="text-lg font-bold text-primary">
              {formatCurrency(displayPrice)}
            </span>
          </div>

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
        </div>


        <PlaceBidButton auctionId={id} isOwner={isOwner} />
      </div>
    </article >
  );
}