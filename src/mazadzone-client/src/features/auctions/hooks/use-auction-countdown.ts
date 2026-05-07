"use client";

import { useEffect, useState } from "react";

/**
 * Hook that provides a real-time countdown to an auction's end date.
 *
 * Updates every second and returns remaining seconds + expiry state.
 */
export function useAuctionCountdown(endDate: string) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateRemaining(endDate),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemaining(endDate);
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return {
    remainingSeconds: Math.max(0, remainingSeconds),
    isExpired: remainingSeconds <= 0,
  };
}

function calculateRemaining(endDate: string): number {
  const endMs = new Date(endDate).getTime();
  const nowMs = Date.now();
  return Math.floor((endMs - nowMs) / 1000);
}
