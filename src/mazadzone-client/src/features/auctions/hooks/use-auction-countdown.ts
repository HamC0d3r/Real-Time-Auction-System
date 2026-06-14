"use client";

import { useMounted } from "@/hooks/use-mounted";
import { differenceInSeconds } from "date-fns";
import { parseUtcDate } from "@/utils/date.utils";
import { useCountdownTick } from "../providers/CountdownProvider";

/**
 * Hook that provides a real-time countdown to an auction's end date.
 */
export function useAuctionCountdown(endDate: Date | string) {
  const isMounted = useMounted();
  // Consume global tick to force synchronous re-renders once per second
  const tick = useCountdownTick();
  const endTimestamp = endDate ? parseUtcDate(endDate).getTime() : 0;

  const remainingSeconds = calculateRemaining(endTimestamp, tick);

  return {
    remainingSeconds: Math.max(0, remainingSeconds),
    isExpired: isMounted ? (remainingSeconds <= 0) : false,
    isMounted,
  };
}

function calculateRemaining(endTimestamp: number, _tick?: number): number {
  if (endTimestamp <= 0) return 0;
  return differenceInSeconds(new Date(endTimestamp), new Date());
}
