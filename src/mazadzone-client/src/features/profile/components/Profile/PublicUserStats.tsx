import { TrendingUp, Trophy, CheckSquare, Gavel } from "lucide-react";
import type { PublicUserProfile } from "../../types/user-profile.types";
import { MetricStrip, type MetricStripItem } from "@/components/ui/metric-strip";

interface PublicUserStatsProps {
  profile: PublicUserProfile;
  isCompact?: boolean;
}

export function PublicUserStats({ profile, isCompact = false }: PublicUserStatsProps) {
  const items: MetricStripItem[] = [
    {
      label: "Auctions Participated",
      value: profile.biddingActivityCount,
      icon: TrendingUp,
      iconClassName: "text-primary",
    },
    {
      label: "Total Bids Placed",
      value: profile.bidsPlacedCount,
      icon: Gavel,
      iconClassName: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Auctions Won",
      value: profile.wonAuctionsCount,
      icon: Trophy,
      iconClassName: "text-amber-500",
    },
    {
      label: "Completed Purchases",
      value: profile.completedPurchasesCount,
      icon: CheckSquare,
      iconClassName: "text-sky-600 dark:text-sky-400",
    },
  ];

  return <MetricStrip items={items} />;
}
