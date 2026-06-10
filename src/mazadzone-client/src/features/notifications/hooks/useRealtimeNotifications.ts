"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createNotificationsHubClient } from "@/lib/signalr";
import { useNotificationStore } from "../store/notification.store";
import { useAppToast } from "@/lib/toast/app-toast";
import { useAuthStore } from "@/stores/auth.store";
import { APP_CONFIG } from "@/config/app.config";
import type { Notification, NotificationType } from "../types/notification.types";
import { triggerWinDialogFromNotification } from "../store/win-dialog.store";

/**
 * Maps a domain NotificationType to a semantic FeedbackType for toast coloring.
 */
function getFeedbackType(type: NotificationType): "success" | "error" | "warning" | "info" {
  switch (type) {
    case "bid_accepted":
    case "bid_placed":
    case "auction_won":
    case "order_received":
    case "payment_authorized":
    case "seller_approved":
    case "account_verified":
      return "success";
    case "outbid":
    case "auction_ending":
    case "dispute_opened":
      return "warning";
    case "payment_failed":
    case "auction_cancelled":
      return "error";
    case "order_shipped":
    case "dispute_resolved":
    case "feedback_received":
    case "new_message":
    case "general":
    default:
      return "info";
  }
}

/**
 * Hook to listen for real-time notifications from the ASP.NET Core SignalR backend.
 *
 * It subscribes to the notifications hub, pushes incoming events into the
 * local Zustand notification store (which renders inside the header bell),
 * and triggers a toast message.
 *
 * Optimistic updates are guarded via `_markOptimistic()` so that stale
 * server refetches (triggered by the delayed invalidation) cannot overwrite
 * the freshly-set Zustand values.
 *
 * @param userId - The authenticated user's ID. Pass empty string / undefined
 *   when not authenticated to skip the connection.
 */
export function useRealtimeNotifications(userId: string | undefined): void {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const incrementUnreadCount = useNotificationStore((state) => state.incrementUnreadCount);
  const markOptimistic = useNotificationStore((state) => state._markOptimistic);
  const appToast = useAppToast();

  useEffect(() => {
    if (!userId) return;

    // Mutable refs for hub and listeners
    let hub: ReturnType<typeof createNotificationsHubClient> | null = null;
    let unsubscribeFn: (() => void) | undefined;
    let retryTimeoutId: NodeJS.Timeout | undefined;
    let delayedInvalidationId: NodeJS.Timeout | undefined;
    let isMounted = true;
    let currentRetry = 0;
    const maxRetries = 3;

    const cleanupHub = () => {
      if (unsubscribeFn) {
        unsubscribeFn();
        unsubscribeFn = undefined;
      }
      if (hub) {
        hub.stop();
        hub = null;
      }
    };

    const startHub = async () => {
      // Ensure any previous hub is torn down before creating a new one
      cleanupHub();

      if (!APP_CONFIG.enableRealtime) {
        console.log('[SignalR Notifications] Realtime disabled by feature flag.');
        return;
      }

      // Create a fresh hub for this attempt
      hub = createNotificationsHubClient(() => useAuthStore.getState().accessToken ?? '');
      const token = useAuthStore.getState().accessToken;
      console.log(`[SignalR Notifications] Attempting connection for userId=${userId}, hasToken=${!!token}`);

      try {
        await hub.start();
        if (!isMounted) {
          hub.stop();
          return;
        }

        console.log('[SignalR Notifications] Connected successfully. Listening for ReceiveNotification events...');

        // Subscribe to live events
        unsubscribeFn = hub.onNotificationReceived((event: any) => {
          console.log('[SignalR Notifications] Live notification received:', event);

          const titleText = event.title || 'Notification';
          const messageText = event.message || event.Message || '';

          // Determine notification type
          let type: NotificationType = 'general';
          const titleLower = titleText.toLowerCase();
          const messageLower = messageText.toLowerCase();
          if (
            titleLower.includes('bid placed') ||
            titleLower.includes('new bid') ||
            messageLower.includes('bid placed') ||
            messageLower.includes('new bid')
          ) {
            type = 'outbid';
          } else if (titleLower.includes('outbid') || messageLower.includes('outbid')) {
            type = 'outbid';
          } else if (titleLower.includes('won') || titleLower.includes('win') || messageLower.includes('won') || messageLower.includes('win')) {
            type = 'auction_won';
          } else if (titleLower.includes('ending') || titleLower.includes('end') || messageLower.includes('ending')) {
            type = 'auction_ending';
          } else if (titleLower.includes('shipped') || messageLower.includes('shipped')) {
            type = 'order_shipped';
          } else if (titleLower.includes('received') || titleLower.includes('delivered') || messageLower.includes('received') || messageLower.includes('delivered')) {
            type = 'order_received';
          } else if (titleLower.includes('payment failed') || titleLower.includes('failed payment') || messageLower.includes('payment failed')) {
            type = 'payment_failed';
          } else if (titleLower.includes('payment') || titleLower.includes('authorized') || messageLower.includes('payment')) {
            type = 'payment_authorized';
          } else if (titleLower.includes('dispute') && (titleLower.includes('opened') || messageLower.includes('opened'))) {
            type = 'dispute_opened';
          } else if (titleLower.includes('dispute') && (titleLower.includes('resolved') || messageLower.includes('resolved'))) {
            type = 'dispute_resolved';
          } else if (titleLower.includes('feedback') || messageLower.includes('feedback')) {
            type = 'feedback_received';
          } else if (titleLower.includes('verified') || messageLower.includes('verified')) {
            type = 'account_verified';
          } else if (titleLower.includes('approved') || titleLower.includes('become seller') || messageLower.includes('approved')) {
            type = 'seller_approved';
          } else if (titleLower.includes('message') || messageLower.includes('message')) {
            type = 'new_message';
          } else if (titleLower.includes('cancel') || messageLower.includes('cancel')) {
            type = 'auction_cancelled';
          }

          // Extract possible UUID for link
          let link = '';
          const idRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
          const match = messageText.match(idRegex) || titleText.match(idRegex);
          if (match) {
            const uuid = match[0];
            if (type.startsWith('auction_') || type === 'outbid') {
              link = `/auctions/${uuid}`;
            } else if (type.startsWith('order_') || type.startsWith('payment_')) {
              link = `/orders/${uuid}`;
            }
          }

          const notification: Notification = {
            id: event.id || Math.random().toString(),
            type,
            title: titleText,
            message: messageText,
            link: link || undefined,
            isRead: false,
            createdAt: new Date().toISOString(),
          };

          // Add to Zustand store (deduped inside store)
          addNotification(notification);
          // Increment badge count
          incrementUnreadCount();
          // Guard optimistic updates
          markOptimistic();
          // Show toast
          const feedbackType = getFeedbackType(type);
          appToast.show(feedbackType, titleText, messageText);
          // Show win dialog if applicable
          if (type === 'auction_won') {
            triggerWinDialogFromNotification(notification);
          }
          // Delayed refetch to sync with DB
          if (delayedInvalidationId) {
            clearTimeout(delayedInvalidationId);
          }
          delayedInvalidationId = setTimeout(() => {
            if (isMounted) {
              void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
          }, 3000);
        });
      } catch (err) {
        if (!isMounted) return;
        if (currentRetry < maxRetries) {
          const nextDelay = Math.pow(2, currentRetry) * 2000 + 5000; // exponential backoff
          console.warn(`[SignalR Notifications] Connection failed. Retrying in ${nextDelay / 1000}s... (${currentRetry + 1}/${maxRetries})`);
          retryTimeoutId = setTimeout(() => {
            currentRetry++;
            startHub();
          }, nextDelay);
        } else {
          console.warn('[SignalR Notifications] Max initial connection attempts reached. Real-time notifications disabled.');
        }
      }
    };

    startHub();

    return () => {
      isMounted = false;
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      if (delayedInvalidationId) clearTimeout(delayedInvalidationId);
      cleanupHub();
    };
  }, [userId, addNotification, incrementUnreadCount, markOptimistic, appToast, queryClient]);
}

