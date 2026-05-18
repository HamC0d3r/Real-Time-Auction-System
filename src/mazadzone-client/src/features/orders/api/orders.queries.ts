import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "./orders.api";

export const ORDERS_KEYS = {
  all: ["orders"] as const,
  myOrders: (userId: string, params: any) => [...ORDERS_KEYS.all, "my-orders", userId, params] as const,
};

/**
 * useGetMyOrders Hook
 * 
 * Hook to retrieve user won orders dynamically from backend / mock layer.
 * Utilizes TanStack Query for cache invalidation and loading state monitoring.
 * 
 * @param userId - The active user's ID
 * @param params - Filtering and pagination options
 */
export const useGetMyOrders = (
  userId: string,
  params: { filter?: string; sortBy?: string; page?: number; pageSize?: number } = {}
) => {
  return useQuery({
    queryKey: ORDERS_KEYS.myOrders(userId, params),
    queryFn: () => fetchMyOrders(userId, params),
    enabled: !!userId,
  });
};
