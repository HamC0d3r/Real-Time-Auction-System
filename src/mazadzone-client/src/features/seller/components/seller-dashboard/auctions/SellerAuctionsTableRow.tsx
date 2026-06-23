"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ViewAction } from "@/components/ui/view-action";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency.utils";
import { ROUTES } from "@/config/routes.config";
import type { SellerAuctionSummaryDto } from "@/features/seller";
import { getAuctionImageFallback, normalizeImageUrl } from "@/features/auctions";

interface SellerAuctionsTableRowProps {
  auction: SellerAuctionSummaryDto;
  onDelete: (id: string) => void;
}

export function SellerAuctionsTableRow({
  auction,
  onDelete,
}: SellerAuctionsTableRowProps) {
  
  const isPending = auction.status.toLowerCase() === "pending" || auction.status.toLowerCase() === "upcoming";

  // Dynamic time-left countdown calculation
  const getTimeLeft = (endDateStr: string, status: string): { text: string; isUrgent: boolean } => {
    const s = status.toLowerCase();
    if (s === "sold" || s === "unsold" || s === "ended" || s === "cancelled") {
      return { text: "—", isUrgent: false };
    }

    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) {
      return { text: "—", isUrgent: false };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { text: `${days}d ${hours}h`, isUrgent: false };
    }

    // Under 24 hours left (Urgent red formatting)
    return { text: `${hours}h ${minutes}m`, isUrgent: true };
  };

  // Dynamic badge and text color styling
  const getStatusDetails = (status: string, endDateStr: string) => {
    const s = status.toLowerCase();
    if (s === "sold" || s === "completed") {
      return {
        label: "Sold",
        styles: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
      };
    }
    if (s === "unsold" || s === "ended") {
      return {
        label: "Unsold",
        styles: "bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-900/30",
      };
    }
    if (s === "pending" || s === "upcoming") {
      return {
        label: "Pending",
        styles: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
      };
    }

    // If active, check if it's ending soon (under 24h)
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    const isEndingSoon = diff > 0 && diff < 24 * 60 * 60 * 1000;

    if (isEndingSoon) {
      return {
        label: "Ending Soon",
        styles: "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30",
      };
    }

    return {
      label: "Active",
      styles: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    };
  };

  const statusInfo = getStatusDetails(auction.status, auction.endDateUtc);
  const timeLeftInfo = getTimeLeft(auction.endDateUtc, auction.status);

  // Fallback thumbnail if null
  const fallbackImg = getAuctionImageFallback(auction.title, 160, 120);
  const [imgSrc, setImgSrc] = useState(normalizeImageUrl(auction.thumbnailUrl) || fallbackImg);

  return (
    <TableRow className="hover:bg-accent/20 dark:hover:bg-accent/5 transition-colors h-[64px] border-0">
      
      {/* Column 1: Auction Info */}
      <TableCell className="px-6 py-3 min-w-[200px]">
        <div className="flex items-center gap-3.5 text-left">
          <div className="h-10 w-14 shrink-0 rounded-lg overflow-hidden relative border border-border/80">
            <Image
              src={imgSrc}
              alt={auction.title}
              fill
              sizes="56px"
              className="object-cover"
              onError={() => {
                setImgSrc(fallbackImg);
              }}
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-foreground truncate max-w-[180px] sm:max-w-[260px]">
              {auction.title}
            </h4>
            <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">
              {auction.category}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Column 2: Category */}
      <TableCell className="px-6 py-3 text-xs font-semibold text-muted-foreground">
        {auction.category}
      </TableCell>

      {/* Column 3: Status Badge */}
      <TableCell className="px-6 py-3">
        <Badge className={cn("px-2.5 py-0.5 rounded-full border shadow-none text-[10px] font-black uppercase tracking-wider", statusInfo.styles)}>
          {statusInfo.label}
        </Badge>
      </TableCell>

      {/* Column 4: Bids */}
      <TableCell className="px-6 py-3 font-bold text-xs text-foreground">
        {auction.bidsCount}
      </TableCell>

      {/* Column 5: Current Bid */}
      <TableCell className="px-6 py-3 font-black text-xs text-foreground">
        {formatCurrency(auction.lastBidAmount)}
      </TableCell>

      {/* Column 6: Time Left */}
      <TableCell className={cn(
        "px-6 py-3 text-xs font-bold",
        timeLeftInfo.isUrgent ? "text-red-500 font-extrabold" : "text-muted-foreground"
      )}>
        {timeLeftInfo.text}
      </TableCell>

      {/* Column 7: Ends At */}
      <TableCell className="px-6 py-3">
        <div className="space-y-0.5 text-left text-[11px] font-semibold">
          <div className="text-foreground">
            {format(new Date(auction.endDateUtc), "MMM d, yyyy")}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {format(new Date(auction.endDateUtc), "h:mm a")}
          </div>
        </div>
      </TableCell>

      {/* Column 8: Actions */}
      <TableCell className="px-6 py-3 text-right pr-8 min-w-[120px]">
        <div className="flex items-center justify-end gap-1.5">
          <ViewAction href={ROUTES.AUCTIONS.DETAIL(auction.auctionId)} />

          <Button
            variant="outline"
            size="icon"
            disabled={!isPending}
            onClick={() => onDelete(auction.auctionId)}
            className={cn(
              "h-8 w-8 rounded-lg border-border/80 shadow-none transition-all",
              isPending
                ? "text-red-500/80 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500/30 cursor-pointer"
                : "text-red-500/30 cursor-not-allowed opacity-40 bg-[#fcfcfc]/50 dark:bg-card border-border/60"
            )}
            title={isPending ? "Delete Auction" : "Only pending auctions can be deleted"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
