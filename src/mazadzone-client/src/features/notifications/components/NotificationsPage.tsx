"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "../store/notification.store";
import { triggerWinDialogFromNotification } from "../store/win-dialog.store";
import { triggerShippingDialogFromNotification } from "../store/shipping-dialog.store";
import { triggerDeliveredDialogFromNotification } from "../store/delivered-dialog.store";
import type { Notification } from "../types/notification.types";
import { useGetNotifications, useMarkAsRead, useMarkAllAsRead } from "../api";
import { NotificationItem } from "./NotificationItem";
import { EmptyNotifications } from "./EmptyNotifications";
import { NotificationPagination } from "./NotificationPagination";
import { useRequireRole } from "@/hooks/use-require-role";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  // Client-side protection: allow bidder, seller, admin roles
  const { isAuthorized, isLoading: isAuthLoading } = useRequireRole(
    ["bidder", "seller", "admin"],
    { bypassTesting: false }
  );

  const user = useAuthStore((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const pageSize = 10;

  // Retrieve notifications using TanStack Query
  const { data, isLoading, isError, refetch } = useGetNotifications(
    user?.id || "",
    currentPage,
    pageSize
  );

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const localMarkAsRead = useNotificationStore((state) => state.markAsRead);
  const localMarkAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const syncFromServer = useNotificationStore((state) => state.syncFromServer);

  // Sync API items to Zustand store (optimistic-aware)
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

    markAllAsRead.mutate(unreadIds);
    localMarkAllAsRead();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
      localMarkAsRead(notification.id);
    }

    if (notification.type === "auction_won") {
      triggerWinDialogFromNotification(notification);
    } else if (notification.type === "order_shipped") {
      triggerShippingDialogFromNotification(notification);
    } else if (notification.type === "order_received") {
      triggerDeliveredDialogFromNotification(notification);
    }
  };

  // Filter notifications based on selected tab
  const displayedNotifications = filter === "all" 
    ? notifications 
    : notifications.filter((n) => !n.isRead);

  const totalPages = data?.totalPages || 0;
  const showMarkAll = !isError && !isLoading && unreadCount > 0;

  if (isAuthLoading || !isAuthorized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground mt-3">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:py-12 space-y-8">
      {/* Back button and title */}
      <div className="flex flex-col gap-4">
        <Link 
          href={ROUTES.HOME} 
          className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0 max-w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Notifications Center</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage and view your live auction alerts, bids, payments, and disputes.
              </p>
            </div>
          </div>
          {showMarkAll && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="gap-2 cursor-pointer border-primary/20 text-primary hover:bg-primary/5 font-semibold text-sm w-full md:w-auto justify-center"
            >
              <CheckCircle2 className="h-4 w-4" />
              {markAllAsRead.isPending ? "Marking..." : "Mark all as read"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar Filter panel */}
        <div className="space-y-4 lg:col-span-1">
          <div className="p-4 border border-border bg-card rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2 mb-3">Filters</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer",
                  filter === "all" 
                    ? "bg-primary text-white shadow-md shadow-primary/10" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <span>All Notifications</span>
                <span className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0",
                  filter === "all" ? "bg-white/20 text-white" : "bg-muted-foreground/10 text-muted-foreground"
                )}>
                  {notifications.length}
                </span>
              </button>

              <button
                onClick={() => setFilter("unread")}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer",
                  filter === "unread" 
                    ? "bg-primary text-white shadow-md shadow-primary/10" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    filter === "unread" ? "bg-white/20 text-white" : "bg-primary text-white"
                  )}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Main panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground mt-2 font-medium">Loading notifications...</p>
              </div>
            ) : isError ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center space-y-4">
                <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                  <Bell className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Failed to sync notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    There was a problem communicating with the server. Please verify your connection and try again.
                  </p>
                </div>
                <Button onClick={() => refetch()} variant="outline" className="cursor-pointer font-bold">
                  Retry Connection
                </Button>
              </div>
            ) : displayedNotifications.length > 0 ? (
              <div className="flex flex-col">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-20">
                <EmptyNotifications />
              </div>
            )}
          </div>

          {/* Pagination panel */}
          {!isLoading && !isError && displayedNotifications.length > 0 && (
            <div className="flex justify-end py-1">
              <NotificationPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="border-none py-0 shadow-none bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
