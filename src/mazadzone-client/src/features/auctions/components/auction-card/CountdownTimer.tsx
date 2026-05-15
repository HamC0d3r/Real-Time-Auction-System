"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuctionCountdown } from "../../hooks/use-auction-countdown";

interface CountdownTimerProps {
  /** ISO date string of when the auction ends */
  endDate: string;
  className?: string;
}

const TIME_BLOCKS = [
  { key: "days", label: "DAYS" },
  { key: "hours", label: "HOURS" },
  { key: "minutes", label: "MINS" },
  { key: "seconds", label: "SECS" },
] as const;

/**
 * Converts total remaining seconds into days, hours, minutes, seconds.
 */
function decompose(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

/**
 * Real-time countdown timer displaying four time blocks (DAYS, HOURS, MINS, SECS)
 * with vertical dividers between each block.
 *
 * Uses `useAuctionCountdown` to tick every second.
 * Displays "Ended" when the auction has expired.
 *
 
 */
export function CountdownTimer({ endDate, className }: CountdownTimerProps) {
  const { remainingSeconds, isExpired, isMounted } = useAuctionCountdown(endDate);

  // -- Hydration Safe Skeleton ---------------------------------
  if (!isMounted) {
    return (
      <div className={cn("flex flex-col items-start gap-1", className)}>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-primary" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Loading...
          </span>
        </div>
        <div className="flex h-[58px] w-[275px] items-center justify-center rounded-[10px] mx-auto bg-creamey animate-pulse" />
      </div>
    );
  }

  // -- Expired State -------------------------------------------
  if (isExpired) {
    return (
      <div className={cn("flex flex-col items-start gap-1", className)}>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-destructive" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-destructive">
            Auction Ended
          </span>
        </div>
        <div
          className="flex h-[58px] w-[275px] items-center justify-center rounded-[10px]"
          style={{ backgroundColor: "oklch(0.9796 0.0158 73.68)" }}
        >
          <span className="text-lg font-extrabold text-destructive">
            Ended
          </span>
        </div>
      </div>
    );
  }

  // -- Active Countdown ----------------------------------------
  const time = decompose(remainingSeconds);
  const values: Record<string, number> = time;
  const isUrgent = remainingSeconds < 300; // less than 5 minutes

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <div className="flex items-center gap-1.5">
        <Clock
          className={cn(
            "size-3.5",
            isUrgent ? "text-destructive" : "text-primary",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wider",
            isUrgent ? "text-destructive" : "text-primary",
          )}
        >
          {isUrgent ? "Ending Soon" : "Auction Ends In"}
        </span>
      </div>

      <div
        className={cn(
          "flex h-[58px] max-w-[275px] items-center justify-center rounded-[10px] mx-auto bg-creamey",
          isUrgent && "ring-2 ring-destructive/30",
        )}
        role="timer"
        aria-label={`Auction ends in ${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}
      >
        {TIME_BLOCKS.map((block, index) => (
          <div key={block.key} className="flex items-center">
            {/* Divider between blocks */}
            {index > 0 && (
              <div
                className="mx-1 h-[30px] w-px bg-black/20"
                aria-hidden="true"
              />
            )}

            {/* Time block */}
            <div className="flex w-[58px] flex-col items-center justify-center">
              <span
                className={cn(
                  "text-[22px] font-extrabold leading-tight tabular-nums",
                  isUrgent ? "text-destructive" : "text-black",
                )}
              >
                {String(values[block.key]).padStart(2, "0")}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                {block.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
