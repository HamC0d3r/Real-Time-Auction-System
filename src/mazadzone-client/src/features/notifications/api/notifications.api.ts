import { api } from "@/lib/api/client";
import { NotificationResponse } from "../types/notification.types";

export const notificationsApi = {
  getNotifications: async (userId: string, page: number, pageSize: number): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>("/notifications", {
      params: { userId, pageNumber: page, pageSize },
    });
    return response.data;
  },


  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post("/notifications/read-all");
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const response = await api.get<{ count: number }>("/notifications/unread-count", {
      params: { userId },
    });
    return response.data.count;
  },
};
