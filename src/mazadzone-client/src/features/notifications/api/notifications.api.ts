import { api } from "@/lib/api/client";
import type { NotificationResponse } from "../types/notification.types";
import type { NotificationsListDto } from "./notifications.contracts";
import { mapNotificationDtoToViewModel } from "./notifications.mappers";

export const notificationsApi = {
  getNotifications: async (
    userId: string,
    page: number,
    pageSize: number
  ): Promise<NotificationResponse> => {
    const response = await api.get<NotificationsListDto>("/notifications", {
      params: { 
        PageNumber: page, 
        PageSize: pageSize,
        t: Date.now(), // Prevent browser caching
      },
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });

    const pagedList = response.data.notifications;
    const items = (pagedList.items || []).map(mapNotificationDtoToViewModel);

    return {
      items,
      totalCount: pagedList.totalCount,
      pageSize: pagedList.pageSize,
      pageNumber: pagedList.pageNumber,
      totalPages: pagedList.totalPages || 1,
    };
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/mark-as-read`);
  },

  markAllAsRead: async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return;
    await Promise.all(
      ids.map((id) => api.post(`/notifications/${id}/mark-as-read`))
    );
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const response = await api.get<NotificationsListDto>("/notifications", {
      params: {
        PageNumber: 1,
        PageSize: 20,
      },
    });

    const items = response.data.notifications?.items || [];
    return items.filter((n) => !n.isRead).length;
  },
};
