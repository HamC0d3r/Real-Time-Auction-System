"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBiddingHubClient } from "@/lib/signalr";
import { useAuthStore } from "@/stores/auth.store";
import { APP_CONFIG } from "@/config/app.config";
import { auctionKeys } from "../api/auction.keys";

/**
 * Hook to establish a real-time SignalR connection to the Bidding / Auctions hub.
 *
 * Listens for `BidPlaced`, `StatusChanged`, and `AuctionCreated` events globally.
 * On each event, invalidates ALL auction queries so any page the user is currently
 * viewing (list, detail, ending-soon, upcoming, seller, category) re-fetches
 * immediately without requiring a page refresh.
 *
 * Why invalidateQueries instead of setQueriesData?
 * - setQueriesData requires the updater to match the exact data shape of every
 *   query variant. A shape mismatch silently returns the old value → no re-render.
 * - invalidateQueries with auctionKeys.all covers every query that starts with
 *   ["auctions"], regardless of variant or filters.
 * - refetchType: "active" ensures only currently-mounted queries re-fetch
 *   immediately; background queries are just marked stale.
 */
export function useRealtimeAuctions(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!APP_CONFIG.enableRealtime) {
      return;
    }

    const hub = createBiddingHubClient(() => useAuthStore.getState().accessToken ?? "");
    let isMounted = true;
    let isConnected = false;
    let unsubscribeBidPlaced: (() => void) | undefined;
    let unsubscribeStatusChanged: (() => void) | undefined;
    let unsubscribeAuctionCreated: (() => void) | undefined;
    let retryTimeoutId: NodeJS.Timeout | undefined;
    let currentRetry = 0;
    const maxRetries = 3;

    /**
     * Invalidate all active auction queries so the UI re-renders immediately.
     * Using auctionKeys.all (["auctions"]) as the prefix ensures every query
     * variant (list, detail, ending-soon, upcoming, category, seller) is covered.
     */
    const invalidateAllAuctions = () => {
      if (!isMounted) return;
      void queryClient.invalidateQueries({
        queryKey: auctionKeys.all,
        refetchType: "active",
      });
    };

    const startHub = async () => {
      try {
        await hub.start();
        if (!isMounted) {
          hub.stop();
          return;
        }

        isConnected = true;
        console.log("[SignalR Auctions] Connected successfully to AuctionsHub.");

        // 1. Bid Placed — current bid price changed
        unsubscribeBidPlaced = hub.onBidPlaced((event) => {
          const rawId = event.auctionId || (event as any).AuctionId;
          const targetId = rawId ? rawId.toLowerCase() : "";
          const newPrice = event.newPrice ?? (event as any).NewPrice;

          if (!targetId || typeof newPrice !== "number") return;

          console.log(`[SignalR Auctions] BidPlaced: ${targetId} → $${newPrice}`);
          invalidateAllAuctions();
        });

        // 2. Status Changed — auction became active, ended, cancelled, etc.
        unsubscribeStatusChanged = hub.onStatusChanged((event) => {
          const rawId = event.auctionId || (event as any).AuctionId;
          const targetId = rawId ? rawId.toLowerCase() : "";
          const rawStatus = event.status || (event as any).Status;

          if (!targetId || !rawStatus) return;

          console.log(`[SignalR Auctions] StatusChanged: ${targetId} → ${rawStatus}`);
          invalidateAllAuctions();
        });

        // 3. Auction Created — new auction appeared on the platform
        unsubscribeAuctionCreated = hub.onAuctionCreated((event) => {
          const rawId = event.auctionId || (event as any).AuctionId;
          console.log(`[SignalR Auctions] AuctionCreated: ${rawId}`);
          invalidateAllAuctions();
        });

      } catch (err) {
        if (!isMounted) return;

        if (currentRetry < maxRetries) {
          const nextDelay = Math.pow(2, currentRetry) * 2000 + 5000;
          console.warn(
            `[SignalR Auctions] Connection failed. Retrying in ${nextDelay / 1000}s... (${currentRetry + 1}/${maxRetries})`
          );
          retryTimeoutId = setTimeout(() => {
            currentRetry++;
            startHub();
          }, nextDelay);
        } else {
          console.warn(
            "[SignalR Auctions] Max initial connection attempts reached. Real-time bidding updates disabled."
          );
        }
      }
    };

    startHub();

    return () => {
      isMounted = false;
      if (unsubscribeBidPlaced) unsubscribeBidPlaced();
      if (unsubscribeStatusChanged) unsubscribeStatusChanged();
      if (unsubscribeAuctionCreated) unsubscribeAuctionCreated();
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      if (isConnected) hub.stop();
    };
  }, [queryClient]);
}
