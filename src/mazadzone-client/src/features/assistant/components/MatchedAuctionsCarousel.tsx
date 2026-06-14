"use client";

import React from "react";
import Image from "next/image";
import { Clock, Shield } from "lucide-react";
import { formatCurrency } from "@/utils/currency.utils";
import { ROUTES } from "@/config/routes.config";
import { Badge } from "@/components/ui/badge";
import { getAuctionImageFallback } from "@/features/auctions";
import { ViewAction } from "@/components/ui/view-action";

export interface CarouselAuctionItem {
  id: string;
  title: string;
  imageUrl: string;
  currentBid: number;
  bidCount: number;
  endDate?: string | Date;
  timeLeftOrStatus: string;
}

interface MatchedAuctionsCarouselProps {
  items: CarouselAuctionItem[];
}

interface CompactAuctionCardProps {
  item: CarouselAuctionItem;
}

function formatTimeRemaining(endDateStr?: string | Date): string {
  if (!endDateStr) return "Ends soon";
  const endDate = new Date(endDateStr);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();

  if (diffMs <= 0) return "Ended";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h left`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m left`;
  }
  return `${diffMins}m left`;
}

function CompactAuctionCard({ item }: CompactAuctionCardProps) {
  const fallbackImg = getAuctionImageFallback(item.title, 200, 200);

  return (
    <div className="flex w-full flex-col rounded-xl border border-border/80 bg-card p-3 shadow-xs hover:shadow-sm transition-all duration-200">
      <div className="flex gap-3">
        {/* Image */}
        <div className="relative size-18 shrink-0 overflow-hidden rounded-lg bg-muted border border-border flex items-center justify-center">
          <Image
            src={item.imageUrl || fallbackImg}
            alt={item.title}
            fill
            className="object-cover"
            onError={(event) => {
              event.currentTarget.src = fallbackImg;
              event.currentTarget.srcset = fallbackImg;
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h4 
              className="line-clamp-2 text-xs font-semibold text-foreground leading-normal" 
              title={item.title}
            >
              {item.title}
            </h4>
          </div>
          
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">Current Bid</span>
              <span className="text-sm font-extrabold text-foreground leading-none">
                {formatCurrency(item.currentBid)}
              </span>
            </div>
            
            <span className="text-[9px] font-bold text-muted-foreground/80 bg-muted border border-border/40 px-1.5 py-0.5 rounded-full select-none">
              {item.bidCount} {item.bidCount === 1 ? "bid" : "bids"}
            </span>
          </div>
        </div>
      </div>

      {/* Timing Info (Dynamic duration with Clock icon) */}
      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/80 pl-0.5">
        <Clock className="size-3 text-orange-500 animate-pulse" />
        <span>
          Ends in <span className="font-semibold text-foreground">{formatTimeRemaining(item.endDate)}</span>
        </span>
      </div>

      {/* Card Action & Status Footer */}
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-dashed border-border/70 pt-2.5">
        <Badge variant="success" className="h-5 px-2.5 text-[9px] font-semibold tracking-wide uppercase select-none">
          Active
        </Badge>

        <ViewAction
          href={ROUTES.AUCTIONS.DETAIL(item.id)}
          className="flex-1 h-7.5 gap-1.5 px-3 text-[10px] font-bold"
        >
          <span>View Details</span>
        </ViewAction>
      </div>
    </div>
  );
}

export function MatchedAuctionsCarousel({ items }: MatchedAuctionsCarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-col w-full gap-3">
      {items.map((auc) => (
        <CompactAuctionCard key={auc.id} item={auc} />
      ))}
    </div>
  );
}
