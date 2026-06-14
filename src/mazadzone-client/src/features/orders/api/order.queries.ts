/**
 * React Query hooks for fetching Orders data.
 * Fully aligned with the real backend DTO contracts.
 */

import { useQuery } from "@tanstack/react-query";
import type { OrderActivity } from "../types/orders.types";
import { getWonOrders, getOrderDetails } from "./order.api";
import { orderKeys } from "./order.keys";
import {
  mapWonOrderSummaryDtoToActivity,
  mapOrderDetailsDtoToActivity,
} from "./order.mappers";
import { useGetAuctionById } from "@/features/auctions";
import { getAuctionById as getAuctionByIdApi } from "@/features/auctions";

// Re-export query keys
export { orderKeys as ORDERS_KEYS };

export interface OrderActivityResponse {
  items: OrderActivity[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

function mapOrderFilterToApiStatus(filter?: string): string | undefined {
  if (!filter || filter === "All") {
    return undefined;
  }

  if (filter === "Cancelled") {
    return "Canceled";
  }

  return filter;
}

/**
 * Hook to retrieve user won orders dynamically from backend.
 * Uses the dedicated won-orders endpoint for the authenticated bidder.
 */
export const useGetMyOrders = (
  params: {
    filter?: string;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  } = {},
  options?: {
    enabled?: boolean;
  },
) => {
  return useQuery<OrderActivityResponse>({
    queryKey: orderKeys.list({ scope: "won", ...params }),
    queryFn: async () => {
      const raw = await getWonOrders({
        status: mapOrderFilterToApiStatus(params.filter),
        pageSize: params.pageSize ?? 5,
        page: params.page ?? 1,
      });

      const items = await Promise.all(
        raw.items.map(async (wonOrder) => {
          try {
            const orderDetails = await getOrderDetails(wonOrder.orderId);
            const auction = await getAuctionByIdApi(orderDetails.auctionId);

            return mapWonOrderSummaryDtoToActivity(wonOrder, {
              id: orderDetails.auctionId,
              title: auction.itemTitle || wonOrder.itemTitle,
              imageUrl: auction.imageUrls?.[0] ?? "",
            });
          } catch (error) {
            console.warn(
              `Failed to enrich won order ${wonOrder.orderId} with auction data:`,
              error,
            );

            return mapWonOrderSummaryDtoToActivity(wonOrder);
          }
        }),
      );

      return {
        items,
        page: raw.pageNumber,
        totalPages: raw.totalPages ?? Math.ceil(raw.totalCount / raw.pageSize),
        totalCount: raw.totalCount,
        hasPreviousPage: raw.hasPreviousPage ?? false,
        hasNextPage: raw.hasNextPage ?? false,
      };
    },
    enabled: options?.enabled ?? true,
  });
};

/**
 * Hook to query detailed order information.
 * Composes both OrderDetails DTO and AuctionSummary info in parallel.
 */
export function useGetOrderDetails(id: string, options?: { enabled?: boolean }) {
  const isEnabled = (options?.enabled !== undefined ? options.enabled : true) && !!id;

  const orderQuery = useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderDetails(id),
    enabled: isEnabled,
  });

  const auctionId = orderQuery.data?.auctionId;

  // Query details of the corresponding auction
  const auctionQuery = useGetAuctionById(
    auctionId || "",
    { enabled: isEnabled && !!auctionId }
  );

  // Combine raw order DTO with auction info via mapping layer
  const mappedData = orderQuery.data
    ? mapOrderDetailsDtoToActivity(
        orderQuery.data,
        auctionQuery.data || undefined,
      )
    : null;

  return {
    data: mappedData,
    isLoading: orderQuery.isLoading || (!!auctionId && auctionQuery.isLoading),
    isError: orderQuery.isError || auctionQuery.isError,
    error: orderQuery.error || auctionQuery.error,
    refetch: async () => {
      await orderQuery.refetch();
      if (auctionId) {
        await auctionQuery.refetch();
      }
    },
  };
}
