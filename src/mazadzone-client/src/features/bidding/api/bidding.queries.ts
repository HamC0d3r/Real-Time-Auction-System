import { useQuery } from "@tanstack/react-query";
import { fetchMyBids } from "./bidding.api";

export const BIDDING_KEYS = {
  all: ["bidding"] as const,
  myBids: (userId: string, params: any) => [...BIDDING_KEYS.all, "my-bids", userId, params] as const,
};

/**
 * Hook to retrieve user bids dynamically from backend / mock layer.
 */
export const useGetMyBids = (
  userId: string,
  params: { filter?: string; sortBy?: string; page?: number; pageSize?: number } = {}
) => {
  return useQuery({
    queryKey: BIDDING_KEYS.myBids(userId, params),
    queryFn: () => fetchMyBids(userId, params),
    enabled: !!userId,
  });
};
