import { api } from "@/lib/api/client";
import { OrderActivity } from "../types/orders.types";
import { getMockOrders } from "../testing/mock-orders";

export interface OrderActivityResponse {
  items: OrderActivity[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * fetchMyOrders Function
 * 
 * Fetches the user's won orders.
 * Backed by mock data during development and structured to easily swap
 * with the real backend API endpoint by uncommenting the block below.
 * 
 * @param userId - The unique identifier of the authenticated user.
 * @param params - Query parameters for filtering, sorting, and paginating.
 * @returns A promise resolving to a paginated OrderActivityResponse.
 */
export async function fetchMyOrders(
  userId: string,
  params: { filter?: string; sortBy?: string; page?: number; pageSize?: number } = {}
): Promise<OrderActivityResponse> {
  /**
   * --- REAL API CALL (Uncomment when backend is ready) ---
   * const { data } = await api.get<OrderActivityResponse>(`/orders/my-orders`, {
   *   params: { userId, ...params }
   * });
   * return data;
   */

  // --- MOCK IMPLEMENTATION ---
  await new Promise((resolve) => setTimeout(resolve, 650)); // Simulate network latency

  const allOrders = getMockOrders();

  // Filter
  const filter = params.filter || "All";
  const filteredOrders = allOrders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  // Sort
  const sortBy = params.sortBy || "latest";
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (sortBy === "latest") {
      return timeB - timeA;
    }
    if (sortBy === "oldest") {
      return timeA - timeB;
    }
    return 0;
  });

  // Paginate
  const page = params.page || 1;
  const pageSize = params.pageSize || 5;
  const totalCount = sortedOrders.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const offset = (page - 1) * pageSize;
  const items = sortedOrders.slice(offset, offset + pageSize);

  return {
    items,
    page,
    totalPages,
    totalCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}
