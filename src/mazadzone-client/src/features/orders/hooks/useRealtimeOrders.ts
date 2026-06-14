"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createOrdersHubClient } from "@/lib/signalr";
import { useAuthStore } from "@/stores/auth.store";
import { APP_CONFIG } from "@/config/app.config";
import { orderKeys } from "../api/order.keys";

export function useRealtimeOrders(userId: string | undefined): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !APP_CONFIG.enableRealtime) {
      return;
    }

    const hub = createOrdersHubClient(() => useAuthStore.getState().accessToken ?? "");
    let isMounted = true;
    let isConnected = false;
    let unsubscribeStatusChanged: (() => void) | undefined;
    let unsubscribeOrderCreated: (() => void) | undefined;
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

        unsubscribeStatusChanged = hub.onOrderStatusChanged((event) => {
          const rawId =
            event.orderId ||
            (event as unknown as Record<string, unknown>)["OrderId"] as string;
          const targetId = rawId ? rawId.toLowerCase() : "";
          if (!targetId) return;

          queryClient.invalidateQueries({ queryKey: orderKeys.detail(targetId) });
          queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        });

        unsubscribeOrderCreated = hub.onOrderCreated((event) => {
          const rawId =
            event.orderId ||
            (event as unknown as Record<string, unknown>)["OrderId"] as string;
          if (!rawId) return;

          queryClient.invalidateQueries({
            queryKey: orderKeys.lists(),
            refetchType: "active",
          });
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
      if (unsubscribeStatusChanged) unsubscribeStatusChanged();
      if (unsubscribeOrderCreated) unsubscribeOrderCreated();
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      if (isConnected) hub.stop();
    };
  }, [userId, queryClient]);
}
