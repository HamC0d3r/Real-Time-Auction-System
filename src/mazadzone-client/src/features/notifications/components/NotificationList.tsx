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

export const NotificationList = () => {
  const user = useAuthStore((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, isError } = useGetNotifications(user?.id || "", currentPage, pageSize);

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  const notifications = data?.items || [];
  const totalPages = data?.totalPages || 0;
  const showMarkAll = !isError && !isLoading && notifications.length > 0;

  return (
    <div className="flex flex-col w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[300px]">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
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
          "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
          "hover:scrollbar-thumb-gray-400 transition-colors",
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-track]:bg-gray-50/50",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:border-2",
          "[&::-webkit-scrollbar-thumb]:border-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-clip-content"
        )}
      >
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 text-center">
            <p className="text-sm text-red-500 font-medium">Failed to load notifications</p>
            <p className="text-xs text-gray-400 mt-1">Please try again later</p>
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
        <div className="py-2 border-t border-gray-100 bg-white">
          <NotificationPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="border-t-0 py-0"
          />
        </div>
      )}
    </div>
  );
};



