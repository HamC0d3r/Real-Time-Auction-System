import type { AuctionStatus, AuctionCondition } from "@/types/domain.constants";

export function mapBackendStatusToAuctionStatus(status?: string): AuctionStatus {
  if (!status) return "Active";
  const normalized = status.toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "upcoming" || normalized === "pending") return "Upcoming";
  if (
    normalized === "ended" ||
    normalized === "endedsold" ||
    normalized === "endedunsold" ||
    normalized === "cancelled"
  ) {
    return "Ended";
  }
  return "Active";
}

export function mapBackendConditionToAuctionCondition(cond?: string): AuctionCondition {
  if (!cond) return "New";
  const normalized = cond.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (normalized === "new") return "New";
  if (normalized === "likenew") return "Like New";
  if (normalized === "good") return "Good";
  if (normalized === "fair") return "Fair";
  return "New";
}