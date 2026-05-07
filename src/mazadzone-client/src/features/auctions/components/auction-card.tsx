import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { formatCurrency } from "@/utils/currency.utils";
import { getRelativeTime } from "@/utils/date.utils";
import type { AuctionSummary } from "../types/auction.types";

interface AuctionCardProps {
  auction: AuctionSummary;
}

/**
 * Card component displaying an auction summary in list/grid views.
 *
 * TODO: Add image thumbnail, bid count badge, and status indicator.
 */
export function AuctionCard({ auction }: AuctionCardProps) {
  return (
    <Link
      href={ROUTES.AUCTIONS.DETAIL(auction.id)}
      className="group block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:shadow-sm"
    >
      {/* Thumbnail placeholder */}
      <div className="mb-3 aspect-[4/3] rounded-md bg-muted" />

      <div className="space-y-1">
        <h3 className="line-clamp-1 font-semibold group-hover:text-primary">
          {auction.title}
        </h3>

        <p className="text-xs text-muted-foreground">{auction.category}</p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium">
            {formatCurrency(auction.currentBid ?? auction.startingPrice)}
          </span>
          <span className="text-xs text-muted-foreground">
            {getRelativeTime(auction.endDate)}
          </span>
        </div>
      </div>
    </Link>
  );
}
