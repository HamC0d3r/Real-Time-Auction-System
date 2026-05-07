import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Auction, CreateAuctionInput, UpdateAuctionInput } from "../types/auction.types";
import { auctionKeys } from "./auction.queries";

/**
 * Creates a new auction.
 * Invalidates the auction list cache on success.
 */
export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAuctionInput) => {
      // TODO: Handle multipart form data for image uploads
      return api.post<Auction>("/auctions", input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
    },
  });
}

/**
 * Updates an existing auction.
 * Invalidates both the list cache and the specific detail cache on success.
 */
export function useUpdateAuction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAuctionInput) =>
      api.patch<Auction>(`/auctions/${id}`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(id),
      });
    },
  });
}
