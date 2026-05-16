import { useQuery } from "@tanstack/react-query";
import { fetchMyBids } from "./bidding.api";

export const BIDDING_KEYS = {
  all: ["bidding"] as const,
  myBids: (userId: string) => [...BIDDING_KEYS.all, "my-bids", userId] as const,
};

/**
 * Hook to retrieve user bids dynamically from backend / mock layer.
 */
export const useGetMyBids = (userId: string) => {
  return useQuery({
    queryKey: BIDDING_KEYS.myBids(userId),
    queryFn: () => fetchMyBids(userId),
    enabled: !!userId,
  });
};
