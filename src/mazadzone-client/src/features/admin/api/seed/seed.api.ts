import { api } from "@/lib/api/client";
import type { SeedGenerateOptions, SeedOperationResult, SeedSummaryStats } from "../../types/seed.types";

const LONG_TIMEOUT_MS = 120000; // 2 minutes for heavy database seed / purge operations

/**
 * Trigger backend seed generation with sysdate live timers.
 * Directly calls ASP.NET Core API: POST /api/v1/admin/seed/generate
 */
export async function generateSeedDataApi(options: SeedGenerateOptions): Promise<SeedOperationResult> {
  const response = await api.post<SeedOperationResult>("/admin/seed/generate", options, {
    timeout: LONG_TIMEOUT_MS,
  });
  return response.data;
}

/**
 * Purge auction data from SQL database while preserving admin accounts & categories.
 * Directly calls ASP.NET Core API: DELETE /api/v1/admin/seed/purge?purgeAll=true
 */
export async function purgeSeedDataApi(purgeAllAuctions: boolean = true): Promise<SeedOperationResult> {
  const response = await api.delete<SeedOperationResult>("/admin/seed/purge", {
    params: { purgeAll: purgeAllAuctions },
    timeout: LONG_TIMEOUT_MS,
  });
  return response.data;
}

/**
 * Atomic reset operation: Purge database auctions & generate fresh sysdate seeds.
 * Directly calls ASP.NET Core API: POST /api/v1/admin/seed/reset
 */
export async function resetSeedDataApi(options: SeedGenerateOptions): Promise<SeedOperationResult> {
  const response = await api.post<SeedOperationResult>("/admin/seed/reset", options, {
    timeout: LONG_TIMEOUT_MS,
  });
  return response.data;
}

/**
 * Get overall statistics on SQL database auctions.
 * Directly calls ASP.NET Core API: GET /api/v1/admin/seed/stats
 */
export async function fetchSeedStatsApi(): Promise<SeedSummaryStats> {
  const response = await api.get<SeedSummaryStats>("/admin/seed/stats", {
    timeout: LONG_TIMEOUT_MS,
  });
  return response.data;
}
