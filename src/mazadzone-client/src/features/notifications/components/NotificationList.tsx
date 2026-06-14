"use client";

import { useState } from "react";
import { NotificationItem } from "./NotificationItem";
import { EmptyNotifications } from "./EmptyNotifications";
import { NotificationPagination } from "./NotificationPagination";
import { Notification } from "../types/notification.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";






import { useGetNotifications, useMarkAsRead, useMarkAllAsRead } from "../api";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

import { useEffect } from "react";
import { useNotificationStore } from "../store/notification.store";
import { triggerWinDialogFromNotification } from "../store/win-dialog.store";
import { triggerShippingDialogFromNotification } from "../store/shipping-dialog.store";
import { triggerDeliveredDialogFromNotification } from "../store/delivered-dialog.store";

import Link from "next/link";

export const NotificationList = () => {
  const user = useAuthStore((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useGetNotifications(user?.id || "", currentPage, pageSize);
  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const decrementUnreadCount = useNotificationStore((state) => state.decrementUnreadCount);
  const resetUnreadCount = useNotificationStore((state) => state.resetUnreadCount);
  const localMarkAsRead = useNotificationStore((state) => state.markAsRead);
  const localMarkAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const syncFromServer = useNotificationStore((state) => state.syncFromServer);

  // Sync loaded React Query items to the Zustand store.
  // syncFromServer handles optimistic-guard logic internally:
  //  - If an optimistic update is pending → merges (preserves live items).
  //  - Otherwise → replaces entirely and recalculates unreadCount.
  useEffect(() => {
    if (data?.items) {
      syncFromServer(data.items);
    }
  }, [data?.items, syncFromServer]);

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // 1. Zero the badge instantly (synchronous)
    resetUnreadCount();
    // 2. Update the notification list in the store instantly
    localMarkAllAsRead();
    // 3. Mutate backend in background
    markAllAsRead.mutate(unreadIds);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      // 1. Decrement badge instantly (synchronous)
      decrementUnreadCount();
      // 2. Mark as read in the store instantly
      localMarkAsRead(notification.id);
      // 3. Mutate backend in background
      markAsRead.mutate(notification.id);
    }

    if (notification.type === "auction_won") {
      triggerWinDialogFromNotification(notification);
    } else if (notification.type === "order_shipped") {
      triggerShippingDialogFromNotification(notification);
    } else if (notification.type === "order_received") {
      triggerDeliveredDialogFromNotification(notification);
    }
  };

  const totalPages = data?.totalPages || 0;
  const showMarkAll = !isError && !isLoading && unreadCount > 0;

  return (
    <div className="flex flex-col w-full max-w-[400px] bg-card rounded-2xl shadow-xl overflow-hidden border border-border min-h-[300px]">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        {showMarkAll && (
          <Button
            variant="link"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="text-primary hover:text-primary/90 p-0 h-auto font-medium disabled:opacity-50"
          >
            {markAllAsRead.isPending ? "Marking..." : "Mark all as read"}
          </Button>
        )}
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto max-h-[500px] min-h-[200px] flex flex-col",
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-track]:bg-muted/30",
          "[&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-thumb]:rounded-full"
        )}
      >
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 text-center">
            <p className="text-sm text-destructive font-medium">Failed to load notifications</p>
            <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        ) : (
          <EmptyNotifications />
        )}
      </div>

      {!isLoading && !isError && notifications.length > 0 && (
        <div className="py-2 border-t border-border bg-card">
          <NotificationPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="border-t-0 py-0"
          />
        </div>
      )}

      <div className="py-2.5 border-t border-border bg-muted/30 text-center flex items-center justify-center">
        <Link
          href="/notifications"
          className="text-xs font-bold text-primary hover:text-primary/90 transition-colors cursor-pointer"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  );
};



