"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency.utils";
import { ROUTES } from "@/config/routes.config";
import type { AuctionSummary } from "../../types/auction.types";

interface SellerAuctionsTableRowProps {
  auction: AuctionSummary;
  onDelete: (id: string) => void;
}

export function SellerAuctionsTableRow({
  auction,
  onDelete,
}: SellerAuctionsTableRowProps) {
  const currentBid = auction.pricing.currentBid ?? auction.pricing.startingPrice;
  const isPending = auction.status === "Upcoming";

  const getStatusBadgeVariant = (status: string, bidCount: number) => {
    const s = status.toLowerCase();
    if (s === "active") {
      return "bg-success text-success-foreground border-success/30";
    }
    if (s === "upcoming" || s === "pending") {
      return "bg-upcoming text-upcoming-foreground border-upcoming/30";
    }
    if (s === "ended") {
      return bidCount > 0
        ? "bg-info text-info-foreground border-info/30"
        : "bg-warning text-warning-foreground border-warning/30";
    }
    return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
  };

  const getStatusLabel = (status: string, bidCount: number) => {
    const s = status.toLowerCase();
    if (s === "active") return "Active";
    if (s === "upcoming" || s === "pending") return "Pending";
    if (s === "ended") {
      return bidCount > 0 ? "Sold" : "Ended";
    }
    return status;
  };

  const statusBadgeStyle = getStatusBadgeVariant(auction.status, auction.pricing.bidCount);
  const statusLabel = getStatusLabel(auction.status, auction.pricing.bidCount);

  return (
    <tr className="hover:bg-accent/40 dark:hover:bg-accent/20 transition-colors">
      {/* Item Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4 text-left">
          <div className="h-12 w-16 shrink-0 rounded-lg overflow-hidden relative border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
              {auction.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {auction.category}
            </p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <Badge className={`${statusBadgeStyle} w-20 h-6  border rounded-full px-2.5 py-0.5 text-sm font-semibold shadow-none capitalize`}>
          {statusLabel}
        </Badge>
      </td>

      {/* Bids */}
      <td className="px-6 py-4 font-semibold text-sm text-foreground">
        {auction.pricing.bidCount}
      </td>

      {/* Current Bid */}
      <td className="px-6 py-4 font-bold text-sm text-foreground">
        {formatCurrency(currentBid)}
      </td>

      {/* End Date */}
      <td className="px-6 py-4">
        <div className="space-y-0.5 text-left text-sm">
          <div className="font-semibold text-foreground">
            {format(new Date(auction.timing.endDate), "MMM d, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(auction.timing.endDate), "h:mm a")}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* View */}
          <Link href={ROUTES.AUCTIONS.DETAIL(auction.id)}>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-primary/15 border-border/80 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-sm"
              title="View Auction"
            >
              <Eye className="h-4.5 w-4.5" />
            </Button>
          </Link>

          {/* Edit */}
          {isPending ? (
            <Link href={ROUTES.SELLER.EDIT_AUCTION(auction.id)}>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-primary/15 border-border/80 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-sm"
                title="Edit Auction"
              >
                <Pencil className="h-4.5 w-4.5" />
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="icon"
              disabled
              className="h-9 w-9 rounded-lg border-border/80 text-muted-foreground/40 cursor-not-allowed opacity-50 shadow-sm"
              title="Only pending auctions can be edited"
            >
              <Pencil className="h-4.5 w-4.5" />
            </Button>
          )}

          {/* Delete */}
          <Button
            variant="outline"
            size="icon"
            disabled={!isPending}
            onClick={() => onDelete(auction.id)}
            className={cn(
              "h-9 w-9 rounded-lg border-border/80 shadow-sm transition-all",
              isPending
                ? "text-destructive/80 hover:text-destructive hover:bg-destructive/15 hover:border-destructive/30 cursor-pointer"
                : "text-destructive/40 cursor-not-allowed opacity-50"
            )}
            title={isPending ? "Delete Auction" : "Only pending auctions can be deleted"}
          >
            <Trash2 className="h-4.5 w-4.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
