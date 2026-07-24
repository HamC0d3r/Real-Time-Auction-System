import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateSeedDataApi, purgeSeedDataApi, resetSeedDataApi, fetchSeedStatsApi } from "./seed.api";
import { seedKeys } from "./seed.keys";
import type { SeedGenerateOptions } from "../../types/seed.types";

export function useSeedStats() {
  return useQuery({
    queryKey: seedKeys.stats(),
    queryFn: fetchSeedStatsApi,
    refetchInterval: 5_000,
  });
}

export function useGenerateSeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options: SeedGenerateOptions) => generateSeedDataApi(options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: seedKeys.all });
      toast.success(result.message || "Sysdate seed data generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Seeding failed: ${error.message}`);
    },
  });
}

export function usePurgeSeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (purgeAllAuctions: boolean = true) => purgeSeedDataApi(purgeAllAuctions),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: seedKeys.all });
      toast.success(result.message || "Auctions & Bids data purged.");
    },
    onError: (error: Error) => {
      toast.error(`Purge failed: ${error.message}`);
    },
  });
}

export function useResetSeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options: SeedGenerateOptions) => resetSeedDataApi(options),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: seedKeys.all });
      toast.success(result.message || "Database reset completed.");
    },
    onError: (error: Error) => {
      toast.error(`Reset failed: ${error.message}`);
    },
  });
}
