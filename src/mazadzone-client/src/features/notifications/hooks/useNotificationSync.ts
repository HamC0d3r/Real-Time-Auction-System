"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { NOTIFICATION_KEYS, useGetNotifications } from "../api/notifications.queries";
import { useNotificationStore } from "../store/notification.store";

/**
 * Lightweight hook that keeps the Zustand notification store in sync
 * with the TanStack Query notification list cache.
 *
 * This should be mounted in a persistent component (e.g. Header) so that
 * when auction events invalidate the notifications query, the store updates
 * and toasts fire even when the notification popover is closed.
 *
 * Fetches page 1 with 10 items — just enough to detect new notifications
 * and show toasts. The header's useGetUnreadCount handles the badge count.
 */
export function useNotificationSync(): void {
  const userId = useAuthStore((state) => state.user?.id);
  const syncFromServer = useNotificationStore((state) => state.syncFromServer);

  const { data } = useGetNotifications(userId || "", 1, 10);

  // Map items to a primitive string key to prevent running synchronization on identical data
  const itemsKey = data?.items
    ? data.items.map((i) => `${i.id}-${i.isRead}`).join(",")
    : "";

  useEffect(() => {
    if (data?.items) {
      syncFromServer(data.items);
    }
  }, [itemsKey, syncFromServer]);
}
