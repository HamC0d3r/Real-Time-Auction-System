/**
 * React Query mutations for the Auctions feature.
 * Fully aligned with the real backend DTO contracts.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAuctionInput,
  UpdateAuctionInput,
} from "../types/auction.types";
import { auctionKeys } from "./auction.keys";
import {
  createAuction,
  activateAuction,
  endAuction,
  cancelAuction,
} from "./auction.api";
import { mapCreateAuctionInputToRequest } from "./auction.mappers";
import { useAppToast } from "@/lib/toast/app-toast";
import type { ApiError } from "@/types/api.types";

/**
 * Creates a new auction listing.
 * Invalidates listing cache on success.
 */
export function useCreateAuction() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  return useMutation<string, ApiError, CreateAuctionInput>({
    mutationFn: async (input: CreateAuctionInput) => {
      const requestDto = mapCreateAuctionInputToRequest(input);
      console.log("Create Auction Request DTO payload being sent to API:", requestDto);
      return createAuction(requestDto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      appToast.success("Success", "Your auction listing has been created.");
    },
    onError: (err) => {
      appToast.error("Error", err.message || "Failed to create auction.");
    },
  });
}

/**
 * Activates an upcoming/pending auction listing.
 */
export function useActivateAuction() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation<void, ApiError, string>({
    mutationFn: (id: string) => activateAuction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.all });
      appToast.success("Success", "Auction listing has been activated.");
    },
    onError: (err) => {
      appToast.error("Error", err.message || "Failed to activate auction.");
    },
  });
}

/**
 * Ends an active auction listing manually.
 */
export function useEndAuction() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation<void, ApiError, string>({
    mutationFn: (id: string) => endAuction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.all });
      appToast.success("Success", "Auction listing has been ended.");
    },
    onError: (err) => {
      appToast.error("Error", err.message || "Failed to end auction.");
    },
  });
}

/**
 * Cancels an auction listing.
 */
export function useCancelAuction() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation<void, ApiError, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => cancelAuction(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.all });
      appToast.success("Success", "Auction listing has been canceled.");
    },
    onError: (err) => {
      appToast.error("Error", err.message || "Failed to cancel auction.");
    },
  });
}

/**
 * Compatibility Wrapper: Simulates updating auction details.
 * (Note: The backend OpenAPI contract does not currently support REST details editing).
 */
export function useUpdateAuction(id: string) {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation<void, ApiError, UpdateAuctionInput>({
    mutationFn: async () => {
      console.warn(
        "Backend OpenAPI contract does not support PUT/PATCH on auction details. Simulating local success.",
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: auctionKeys.detail(id) });
      appToast.success("Success", "Auction changes saved (local simulation).");
    },
  });
}

/**
 * Compatibility Wrapper: Maps deletion to the backend's cancellation REST action.
 */
export function useDeleteAuction() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation<void, ApiError, string>({
    mutationFn: (id: string) => cancelAuction(id, "Seller deleted listing"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auctionKeys.all });
      appToast.success("Success", "Auction listing has been removed.");
    },
    onError: (err) => {
      appToast.error(
        "Error",
        err.message || "Could not remove the auction listing.",
      );
    },
  });
}
