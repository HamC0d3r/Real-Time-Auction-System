"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBiddingHubClient } from "@/lib/signalr";
import { useAuthStore } from "@/stores/auth.store";
import { APP_CONFIG } from "@/config/app.config";
import { auctionKeys } from "../api/auction.keys";
import { AuctionStatus } from "../types/auction.types";
import type { AuctionSummary } from "../types/auction.types";
import { NOTIFICATION_KEYS } from "@/features/notifications/api/notifications.queries";

/**
 * Maps standard backend status string values to front-end AuctionStatus enum values.
 */
function mapBackendStatusToFrontend(backendStatus: string): AuctionStatus {
  const normalized = backendStatus.toLowerCase();
  if (normalized.includes("active")) return AuctionStatus.ACTIVE;
  if (
    normalized.includes("ended") ||
    normalized.includes("completed") ||
    normalized.includes("cancelled")
  ) {
    return AuctionStatus.ENDED;
  }
  return AuctionStatus.UPCOMING;
}

/**
 * Hook to establish a real-time SignalR connection to the Bidding / Auctions hub.
 *
 * It listens for `BidPlaced`, `StatusChanged`, and `AuctionCreated` events globally.
 * When events are received, it performs high-efficiency, zero-lag local updates to the
 * TanStack Query cache so the UI updates instantly, and schedules background query invalidations
 * to fetch official database logs and history.
 */
export function useRealtimeAuctions(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Respect central realtime feature flag
    if (!APP_CONFIG.enableRealtime) {
      return;
    }

    // Pass the access token factory so authenticated connections can be resolved seamlessly
    const hub = createBiddingHubClient(() => useAuthStore.getState().accessToken ?? "");
    let isMounted = true;
    let isConnected = false;
    let unsubscribeBidPlaced: (() => void) | undefined;
    let unsubscribeStatusChanged: (() => void) | undefined;
    let unsubscribeAuctionCreated: (() => void) | undefined;
    let retryTimeoutId: NodeJS.Timeout | undefined;
    let notificationRefetchTimer: NodeJS.Timeout | undefined;
    let currentRetry = 0;
    const maxRetries = 3;

    /**
     * Schedule a delayed notification query refetch.
     * The backend creates DB notifications in the same transaction as auction events,
     * so we wait 2s to let the write commit before refetching.
     * Debounced: rapid events (e.g., create → cancel → active) only trigger one refetch.
     */
    const scheduleNotificationRefetch = () => {
      if (notificationRefetchTimer) {
        clearTimeout(notificationRefetchTimer);
      }
      notificationRefetchTimer = setTimeout(() => {
        if (isMounted) {
          void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
        }
      }, 2000);
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

        // 1. Subscribe to Live Bid Placed events
        unsubscribeBidPlaced = hub.onBidPlaced((event) => {
          const rawId = event.auctionId || (event as any).AuctionId;
          const targetId = rawId ? rawId.toLowerCase() : "";
          const newPrice = event.newPrice || (event as any).NewPrice;

          if (!targetId || typeof newPrice !== "number") return;

          console.log(`[SignalR Auctions] Live bid update received for ${targetId}: ${newPrice}`);

          // Deeply update the query cache dynamically for all matching queries in the cache
          const updateCacheBid = (old: any): any => {
            if (!old) return old;

            // Case 1: Detailed single item
            if (old.id && old.id.toLowerCase() === targetId) {
              const currentPrice = old.pricing.currentBid ?? old.pricing.startingPrice;
              if (newPrice <= currentPrice) return old;
              return {
                ...old,
                pricing: {
                  ...old.pricing,
                  currentBid: newPrice,
                  bidCount: old.pricing.bidCount + 1,
                },
              };
            }

            // Case 2: Paginated response
            if (old.items && Array.isArray(old.items)) {
              return {
                ...old,
                items: old.items.map((item: any) => {
                  if (item.id.toLowerCase() !== targetId) return item;
                  const currentPrice = item.pricing.currentBid ?? item.pricing.startingPrice;
                  if (newPrice <= currentPrice) return item;
                  return {
                    ...item,
                    pricing: {
                      ...item.pricing,
                      currentBid: newPrice,
                      bidCount: item.pricing.bidCount + 1,
                    },
                  };
                }),
              };
            }

            // Case 3: Simple array of items
            if (Array.isArray(old)) {
              return old.map((item: any) => {
                if (!item.id || item.id.toLowerCase() !== targetId) return item;
                const currentPrice = item.pricing.currentBid ?? item.pricing.startingPrice;
                if (newPrice <= currentPrice) return item;
                return {
                  ...item,
                  pricing: {
                    ...item.pricing,
                    currentBid: newPrice,
                    bidCount: item.pricing.bidCount + 1,
                  },
                };
              });
            }

            return old;
          };

          queryClient.setQueriesData<any>({ queryKey: ["auctions"] }, updateCacheBid);

          // Trigger soft invalidation to fetch updated bid history entries in the background
          void queryClient.invalidateQueries({
            queryKey: auctionKeys.detail(targetId),
          });

          // Invalidate list endpoints so price updates reflect on browse pages
          void queryClient.invalidateQueries({
            queryKey: auctionKeys.lists(),
          });

          // The backend may create notifications for affected bidders (outbid, etc.)
          scheduleNotificationRefetch();
        });

        // 2. Subscribe to Live Status Changed events
        unsubscribeStatusChanged = hub.onStatusChanged((event) => {
          const rawId = event.auctionId || (event as any).AuctionId;
          const targetId = rawId ? rawId.toLowerCase() : "";
          const rawStatus = event.status || (event as any).Status;

          if (!targetId || !rawStatus) return;

          console.log(`[SignalR Auctions] Live status change received for ${targetId}: ${rawStatus}`);
          const mappedStatus = mapBackendStatusToFrontend(rawStatus);

          // Deeply update the query cache dynamically for all matching queries in the cache
          const updateCacheStatus = (old: any): any => {
            if (!old) return old;

            // Case 1: Detailed single item
            if (old.id && old.id.toLowerCase() === targetId) {
              return {
                ...old,
                status: mappedStatus,
              };
            }

            // Case 2: Paginated response
            if (old.items && Array.isArray(old.items)) {
              return {
                ...old,
                items: old.items.map((item: any) =>
                  item.id.toLowerCase() === targetId
                    ? { ...item, status: mappedStatus }
                    : item
                ),
              };
            }

            // Case 3: Simple array of items
            if (Array.isArray(old)) {
              return old.map((item: any) =>
                item.id && item.id.toLowerCase() === targetId
                  ? { ...item, status: mappedStatus }
                  : item
              );
            }

            return old;
          };

          queryClient.setQueriesData<any>({ queryKey: ["auctions"] }, updateCacheStatus);

          // Force fresh fetch for lists and details
          void queryClient.invalidateQueries({
            queryKey: auctionKeys.detail(targetId),
          });
          void queryClient.invalidateQueries({
            queryKey: auctionKeys.lists(),
          });

          // The backend creates notifications for owners/participants on status changes
          scheduleNotificationRefetch();
        });

        // 3. Subscribe to Live Auction Created events
        unsubscribeAuctionCreated = hub.onAuctionCreated((event) => {
          const rawId = event.auctionId || (event as any).AuctionId;
          const targetId = rawId ? rawId.toLowerCase() : "";
          console.log(`[SignalR Auctions] Live new auction created: ${targetId}`);

          // Invalidate list endpoints so the new auction appears in the feed
          void queryClient.invalidateQueries({
            queryKey: auctionKeys.lists(),
          });

          // The backend creates a notification for the seller on auction creation
          scheduleNotificationRefetch();
        });

      } catch (err) {
        if (!isMounted) return;

        if (currentRetry < maxRetries) {
          const nextDelay = Math.pow(2, currentRetry) * 2000 + 5000; // 7s, 9s, 13s backoff
          console.warn(
            `[SignalR Auctions] Connection failed. Retrying in ${nextDelay / 1000}s... (${currentRetry + 1}/${maxRetries})`
          );
          retryTimeoutId = setTimeout(() => {
            currentRetry++;
            startHub();
          }, nextDelay);
        } else {
          console.warn(
            `[SignalR Auctions] Max initial connection attempts reached. Real-time bidding updates disabled.`
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
      if (notificationRefetchTimer) clearTimeout(notificationRefetchTimer);
      
      if (isConnected) {
        hub.stop();
      }
    };
  }, [queryClient]);
}
