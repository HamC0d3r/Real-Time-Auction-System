"use client";

import { useEffect } from "react";
import { createNotificationsHubClient } from "@/lib/signalr";
import { useNotificationStore } from "../store/notification.store";
import { useAppToast } from "@/lib/toast/app-toast";
import { useAuthStore } from "@/stores/auth.store";
import { getAccessToken } from "@/lib/auth/token";
import { APP_CONFIG } from "@/config/app.config";
import type { Notification, NotificationType } from "../types/notification.types";
import { triggerWinDialogFromNotification } from "../store/win-dialog.store";
import { triggerShippingDialogFromNotification } from "../store/shipping-dialog.store";
import { triggerDeliveredDialogFromNotification } from "../store/delivered-dialog.store";
import { getOrderDetails } from "@/features/orders/api/order.api";

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
 * @param userId - The authenticated user's ID. Pass empty string / undefined
 *   when not authenticated to skip the connection.
 */
const ID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

const hasAny = (title: string, message: string, ...keywords: string[]) =>
  keywords.some((kw) => title.includes(kw) || message.includes(kw));

const TYPE_MATCHERS: { match: (title: string, message: string) => boolean; type: NotificationType }[] = [
  { match: (t, m) => hasAny(t, m, 'shipped', 'on the way', 'sent', 'transit'), type: 'order_shipped' },
  { match: (t, m) => hasAny(t, m, 'received', 'delivered'), type: 'order_received' },
  { match: (t, m) => hasAny(t, m, 'bid placed', 'new bid'), type: 'outbid' },
  { match: (t, m) => hasAny(t, m, 'outbid'), type: 'outbid' },
  { match: (t, m) => hasAny(t, m, 'won', 'win'), type: 'auction_won' },
  { match: (t, m) => hasAny(t, m, 'ending') || t.includes('end'), type: 'auction_ending' },
  { match: (t, m) => hasAny(t, m, 'payment failed', 'failed payment'), type: 'payment_failed' },
  { match: (t, m) => hasAny(t, m, 'payment', 'authorized'), type: 'payment_authorized' },
  { match: (t, m) => t.includes('dispute') && hasAny(t, m, 'opened'), type: 'dispute_opened' },
  { match: (t, m) => t.includes('dispute') && hasAny(t, m, 'resolved'), type: 'dispute_resolved' },
  { match: (t, m) => hasAny(t, m, 'feedback'), type: 'feedback_received' },
  { match: (t, m) => hasAny(t, m, 'verified'), type: 'account_verified' },
  { match: (t, m) => hasAny(t, m, 'approved', 'become seller'), type: 'seller_approved' },
  { match: (t, m) => hasAny(t, m, 'message'), type: 'new_message' },
  { match: (t, m) => hasAny(t, m, 'cancel'), type: 'auction_cancelled' },
];

export function useRealtimeNotifications(userId: string | undefined): void {
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
        return;
      }

      // Create a fresh hub for this attempt
      hub = createNotificationsHubClient(() => useAuthStore.getState().accessToken || getAccessToken() || '');

      try {
        await hub.start();
        if (!isMounted) {
          hub.stop();
          return;
        }

        // Subscribe to live events
        unsubscribeFn = hub.onNotificationReceived(async (event) => {
          const evt = event as unknown as Record<string, unknown>;
          const titleText = (evt.title as string) || 'Notification';
          const messageText = (evt.message as string) || (evt.Message as string) || '';

          // Determine notification type
          let type: NotificationType = 'general';
          const titleLower = titleText.toLowerCase();
          const messageLower = messageText.toLowerCase();
          for (const matcher of TYPE_MATCHERS) {
            if (matcher.match(titleLower, messageLower)) {
              type = matcher.type;
              break;
            }
          }

          // Extract possible UUID for link
          let link = '';
          const match = messageText.match(ID_REGEX) || titleText.match(ID_REGEX);
          if (match) {
            const uuid = match[0];
            if (type.startsWith('auction_') || type === 'outbid') {
              link = `/auctions/${uuid}`;
            } else if (type.startsWith('order_') || type.startsWith('payment_')) {
              link = `/orders/${uuid}`;
            }
          }

          // ── Ownership guard ────────────────────────────────────────────
          // Only the buyer/winner (bidderId) should receive order_shipped
          // and order_received notifications. Skip if the current user is
          // the seller or an unrelated user.
          if (type === 'order_shipped' || type === 'order_received') {
            const orderId = match?.[0];
            if (orderId) {
              try {
                const currentUserId = useAuthStore.getState().user?.id;
                const order = await getOrderDetails(orderId);
                if (order.bidderId !== currentUserId) {
                  return;
                }
              } catch {
                return;
              }
            }
          }
          // ───────────────────────────────────────────────────────────────

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
          // Show win or shipping dialog if applicable
          if (type === 'auction_won') {
            triggerWinDialogFromNotification(notification);
          } else if (type === 'order_shipped') {
            triggerShippingDialogFromNotification(notification);
          } else if (type === 'order_received') {
            triggerDeliveredDialogFromNotification(notification);
          }
        });
      } catch (err) {
        if (!isMounted) return;
        if (currentRetry < maxRetries) {
          const nextDelay = Math.pow(2, currentRetry) * 2000 + 5000;
          retryTimeoutId = setTimeout(() => {
            currentRetry++;
            startHub();
          }, nextDelay);
        }
      }
    };

    startHub();

    return () => {
      isMounted = false;
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      cleanupHub();
    };
  }, [userId, addNotification, incrementUnreadCount, markOptimistic, appToast]);
}

