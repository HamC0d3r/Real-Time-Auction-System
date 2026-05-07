"use client";

import { useAuctionCountdown } from "../hooks/use-auction-countdown";
import { formatCountdown } from "@/utils/date.utils";
import { cn } from "@/lib/utils";

interface AuctionTimerProps {
  /** ISO date string of when the auction ends */
  endDate: string;
  className?: string;
}

/**
 * Real-time countdown timer for an auction.
 *
 * Displays remaining time in HH:MM:SS format.
 * Turns red when less than 5 minutes remain.
 */
export function AuctionTimer({ endDate, className }: AuctionTimerProps) {
  const { remainingSeconds, isExpired } = useAuctionCountdown(endDate);

  if (isExpired) {
    return (
      <span className={cn("text-sm font-medium text-destructive", className)}>
        Ended
      </span>
    );
  }

  const isUrgent = remainingSeconds < 300; // less than 5 minutes

  return (
    <span
      className={cn(
        "tabular-nums text-sm font-medium",
        isUrgent ? "text-destructive" : "text-foreground",
        className,
      )}
    >
      {formatCountdown(remainingSeconds)}
    </span>
  );
}
