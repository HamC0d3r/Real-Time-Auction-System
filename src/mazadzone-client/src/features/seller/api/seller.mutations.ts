import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { type PayoutDetails } from "@/features/payment";
import { type ApiResponse } from "@/types/api.types";

export interface BecomeSellerInput {
  payoutDetails: PayoutDetails;
}

export interface BecomeSellerResponse {
  success: boolean;
  message: string;
  sellerProfileId?: string;
  role: string;
}

/**
 * Mutation to register a user as a seller on the platform.
 * Transmits verified account profile and selected payout method details (card or bank transfer) to the server.
 */
export function useBecomeSeller() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<BecomeSellerResponse>, Error, BecomeSellerInput>({
    mutationFn: (input: BecomeSellerInput) => {
      return api.post<BecomeSellerResponse>("/seller/register", input);
    },
    onSuccess: () => {
      // Invalidate core auth/profile queries on success
      void queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      void queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
