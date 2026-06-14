"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBiddingHubClient } from "@/lib/signalr";
import { useAuthStore } from "@/stores/auth.store";
import { APP_CONFIG } from "@/config/app.config";
import { auctionKeys } from "../api/auction.keys";

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

    const startHub = async () => {
      try {
        await hub.start();
        if (!isMounted) {
          hub.stop();
          return;
        }

        isConnected = true;

        unsubscribeBidPlaced = hub.onBidPlaced((event) => {
          const rawId = event.auctionId || (event as unknown as Record<string, unknown>)["AuctionId"] as string;
          const targetId = rawId ? rawId.toLowerCase() : "";
          if (!targetId) return;

          queryClient.invalidateQueries({ queryKey: auctionKeys.detail(targetId) });
        });

        unsubscribeStatusChanged = hub.onStatusChanged((event) => {
          const rawId = event.auctionId || (event as unknown as Record<string, unknown>)["AuctionId"] as string;
          const targetId = rawId ? rawId.toLowerCase() : "";
          if (!targetId) return;

          queryClient.invalidateQueries({ queryKey: auctionKeys.detail(targetId) });
        });

        unsubscribeAuctionCreated = hub.onAuctionCreated((event) => {
          const rawId = event.auctionId || (event as unknown as Record<string, unknown>)["AuctionId"] as string;
          if (!rawId) return;
          queryClient.invalidateQueries({ queryKey: auctionKeys.lists(), refetchType: "active" });
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