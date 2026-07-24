import type { AuctionCategory } from "@/types/domain.constants";

export interface SeedLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
  durationMs?: number;
}

export interface SeedGenerateOptions {
  /** Total auctions to generate (default: 10) */
  count: number;
  /** Presets for quick seeding */
  preset?: "quick_refresh" | "sysdate_live" | "live_only" | "upcoming_only" | "ended_only" | "custom";
  /** Filter categories to generate for (empty array means all) */
  categories?: AuctionCategory[];
  /** Ratio of statuses for custom generation */
  statusRatio?: {
    active: number;    // percentage
    upcoming: number;  // percentage
    ended: number;     // percentage
  };
  /** Dynamic time offset bounds in minutes/hours relative to sysdate */
  timeOffsets?: {
    activeEndInMinutes?: number;    // e.g. 30 or 60 minutes for working live timer
    upcomingStartInMinutes?: number;// e.g. 15 minutes from now
  };
  /** Include realistic mock bids for active and ended auctions */
  includeBids?: boolean;
  /** Purge all old auctions before generating */
  purgeAllFirst?: boolean;
}

export interface SeedPurgeOptions {
  /** If true, purges all auctions (old + mock) while preserving Admin accounts & categories */
  purgeAllAuctions?: boolean;
}

export interface SeedSummaryStats {
  totalMockAuctions: number;
  activeCount: number;
  expiringSoonCount: number; // Ending in < 3 hours
  upcomingCount: number;
  endedCount: number;
  totalMockBids: number;
  lastSeededAt: string | null;
}

export interface SeedOperationResult {
  success: boolean;
  action: "generate" | "purge" | "reset";
  generatedCount: number;
  purgedCount: number;
  executionDurationMs: number;
  message: string;
  timestamp: string;
}
