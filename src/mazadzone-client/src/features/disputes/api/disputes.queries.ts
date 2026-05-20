import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fileDispute } from "./disputes.api";
import type { CreateDisputeInput, Dispute } from "../types/disputes.types";

export const disputeKeys = {
  all: ["disputes"] as const,
};

/**
 * Mutation to file a dispute for an order.
 */
export function useFileDispute() {
  const queryClient = useQueryClient();

  return useMutation<Dispute, Error, CreateDisputeInput>({
    mutationFn: fileDispute,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.all });
    },
  });
}
