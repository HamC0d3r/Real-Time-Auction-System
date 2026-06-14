import { useQuery } from "@tanstack/react-query";
import { fetchSavedPaymentMethods } from "./payment.api";
import { paymentKeys } from "./payment.keys";
import { mapPaymentMethodResponseToSavedPaymentMethod } from "./payment.mappers";
import type { SavedPaymentMethod } from "../types";

export function useGetSavedPaymentMethods(options?: { enabled?: boolean }) {
  return useQuery<SavedPaymentMethod[]>({
    queryKey: paymentKeys.savedMethods(),
    queryFn: async () => {
      const paymentMethods = await fetchSavedPaymentMethods();
      return paymentMethods.map(mapPaymentMethodResponseToSavedPaymentMethod);
    },
    ...options,
  });
}
