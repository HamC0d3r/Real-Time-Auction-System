import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { notificationsApi } from "./notifications.api";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  lists: () => [...NOTIFICATION_KEYS.all, "list"] as const,
  list: (userId: string, page: number, pageSize: number) => [...NOTIFICATION_KEYS.lists(), { userId, page, pageSize }] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
};

export const useGetNotifications = (userId: string, page: number, pageSize: number) => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(userId, page, pageSize),
    queryFn: () => notificationsApi.getNotifications(userId, page, pageSize),
    enabled: !!userId,
    placeholderData: (previousData) => previousData,
  });
};


export const useGetUnreadCount = (userId: string, options?: Partial<UseQueryOptions<number>>) => {
  return useQuery({
    queryKey: [...NOTIFICATION_KEYS.unreadCount(), userId],
    queryFn: () => notificationsApi.getUnreadCount(userId),
    refetchInterval: 60000, // Refetch every minute
    enabled: !!userId,
    ...options,
  });
};


