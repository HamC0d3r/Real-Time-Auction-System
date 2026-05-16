"use client";

import { Clock, Play, Flag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuctionCountdown } from "@/features/auctions";

interface CountdownTimerProps {
  /** Date object of when the auction starts */
  startDate?: Date;
  /** Date object of when the auction ends */
  endDate: Date;
  variant?: "default" | "large" | "minimal";
  className?: string;
  /** Override the default header label (e.g. "AUCTION STARTS IN") */
  label?: string;
  /** Current status of the auction */
  status?: string;
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
 * Real-time countdown timer.
 * Supported variants:
 * - "default" / "large": Standard block designs with grids.
 * - "minimal": Compact inline representation (e.g., for rows/lists) with ticking real-time support.
 */
export function CountdownTimer({
  startDate,
  endDate,
  variant = "default",
  className,
  label,
  status,
}: CountdownTimerProps) {
  const targetDate = status === "Upcoming" && startDate ? startDate : endDate;
  const { remainingSeconds, isExpired, isMounted } = useAuctionCountdown(targetDate);
  const isLarge = variant === "large";
  const isEnded = status === "Ended" || isExpired;

  // -- Hydration Safe Skeleton ---------------------------------
  if (!isMounted) {
    if (variant === "minimal") {
      return (
        <div className={cn("flex items-center gap-1.5 text-gray-400 text-sm font-medium animate-pulse", className)}>
          <Clock className="w-4 h-4 shrink-0" />
          <span>00:00:00</span>
        </div>
      );
    }
    return (
      <div className={cn("flex flex-col items-start gap-1", className)}>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-primary" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Loading...
          </span>
        </div>
        <div
          className={cn(
            "rounded-[10px] mx-auto bg-creamey animate-pulse",
            isLarge ? "h-[72px] w-full" : "h-[58px] w-[275px]"
          )}
        />
      </div>
    );
  }

  // -- Minimal Variant -------------------------------------------
  if (variant === "minimal") {
    if (isEnded) {
      return (
        <div className={cn("flex items-center gap-1.5 text-gray-500 text-[17px] font-medium", className)}>
          <Clock className="w-5 h-5 shrink-0 text-gray-400" />
          <span>Ended</span>
        </div>
      );
    }
    const time = decompose(remainingSeconds);
    const isUrgent = remainingSeconds < 300 && status !== "Upcoming";

    let timeLeftStr = "";
    if (time.days > 0) {
      timeLeftStr = `${time.days}d ${time.hours}h ${time.minutes}m`;
    } else {
      timeLeftStr = `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    }

    return (
      <div className={cn("flex items-center gap-1.5 text-gray-600 text-[17px] font-medium", className)}>
        <Clock className={cn("w-5 h-5 shrink-0", isUrgent ? "text-destructive" : "text-primary")} />
        <span className={cn("whitespace-nowrap", isUrgent && "text-destructive font-bold")}>
          {timeLeftStr}
        </span>
      </div>
    );
  }

  // -- Expired State -------------------------------------------
  if (isEnded) {
    return (
      <div className={cn("flex flex-col items-start gap-1", className)}>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Auction Ended
          </span>
        </div>
        <div
          className={cn(
            "flex items-center justify-center rounded-[10px] bg-muted/50",
            isLarge ? "h-[72px] w-full" : "h-[58px] w-[275px]"
          )}
        >
          <span className={cn("font-extrabold text-muted-foreground", isLarge ? "text-xl" : "text-lg")}>
            Ended
          </span>
        </div>
      </div>
    );
  }

  // -- Active Countdown ----------------------------------------
  const time = decompose(remainingSeconds);
  const values: Record<string, number> = time;
  const isUrgent = remainingSeconds < 300 && status !== "Upcoming";
  const isUpcoming = status === "Upcoming";

  return (
    <div className={cn("flex flex-col items-start gap-1 w-full", className)}>
      <div className="flex w-full items-center justify-between">
        {startDate ? (
          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            <Play className="size-3 flex-shrink-0" aria-hidden="true" />
            <span>{format(startDate, "yyyy/MM/dd , hh:mm a")}</span>
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          <Flag className="size-3 flex-shrink-0" aria-hidden="true" />
          <span>{format(endDate, "yyyy/MM/dd , hh:mm a")}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-1">
        <Clock
          className={cn(
            "size-3.5",
            isUrgent ? "text-destructive" : isUpcoming ? "text-upcoming-foreground" : "text-primary",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wider",
            isUrgent ? "text-destructive" : isUpcoming ? "text-upcoming-foreground" : "text-primary",
          )}
        >
          {label ?? (isUrgent ? "Ending Soon" : "Auction Ends In")}
        </span>
      </div>

      <div
        className={cn(
          "flex items-center justify-center rounded-[10px] mx-auto bg-creamey",
          isLarge ? "h-[72px] w-full px-6" : "h-[58px] max-w-[275px]",
          isUrgent && "ring-2 ring-destructive/30",
        )}
        role="timer"
        aria-label={`Auction ends in ${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}
      >
        {TIME_BLOCKS.map((block, index) => (
          <div key={block.key} className={cn("flex items-center", isLarge && "flex-1")}>
            {index > 0 && (
              <div
                className={cn("bg-black/20", isLarge ? "mx-4 h-[40px] w-px" : "mx-1 h-[30px] w-px")}
                aria-hidden="true"
              />
            )}

            <div className={cn("flex flex-col items-center justify-center", isLarge ? "flex-1" : "w-[58px]")}>
              <span
                className={cn(
                  "font-extrabold leading-tight tabular-nums",
                  isLarge ? "text-3xl" : "text-[22px]",
                  isUrgent ? "text-destructive" : "text-black",
                )}
              >
                {String(values[block.key]).padStart(2, "0")}
              </span>
              <span className={cn("font-semibold uppercase tracking-wider text-muted-foreground", isLarge ? "text-[11px]" : "text-[9px]")}>
                {block.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
