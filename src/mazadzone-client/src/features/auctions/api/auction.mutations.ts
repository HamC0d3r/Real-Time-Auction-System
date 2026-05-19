import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Auction, CreateAuctionInput, UpdateAuctionInput } from "../types/auction.types";
import { auctionKeys } from "./auction.queries";
import { createAuctionApi, updateAuctionApi, deleteAuctionApi } from "./auctions.api";

/**
 * Creates a new auction.
 * Invalidates the auction list cache on success.
 */
export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAuctionInput) => createAuctionApi(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
    },
  });
}

export function useUpdateAuction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAuctionInput) => updateAuctionApi(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(id),
      });
    },
  });
}

import type { ApiError, ApiResponse } from "@/types/api.types";
import { useNotificationStore } from "@/stores/notification.store";

/**
 * Deletes an auction.
 */
export function useDeleteAuction() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useMutation<ApiResponse<void>, ApiError, string>({
    mutationFn: (id: string) => deleteAuctionApi(id),
    onSuccess: (response) => {
      // Invalidate all auction queries to force refetching of tables, stats, and details
      void queryClient.invalidateQueries({ queryKey: auctionKeys.all });
      addNotification({
        type: "success",
        title: "Success",
        message: response.message || "Your auction listing has been successfully removed.",
        duration: 3000,
      });
    },
    onError: (err) => {
      addNotification({
        type: "error",
        title: "Error",
        message: err.message || "Could not delete the auction listing.",
        duration: 4000,
      });
    },
  });
}

