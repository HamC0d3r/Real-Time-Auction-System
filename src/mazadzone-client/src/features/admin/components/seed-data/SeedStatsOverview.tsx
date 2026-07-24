import { MetricStrip, type MetricStripItem } from "@/components/ui/metric-strip";
import type { SeedSummaryStats } from "../../types/seed.types";
import { Activity, Clock, Flame, Gavel, Sparkles, CheckCircle2 } from "lucide-react";

export interface SeedStatsOverviewProps {
  stats: SeedSummaryStats | undefined;
  isLoading?: boolean;
}

export function SeedStatsOverview({ stats, isLoading = false }: SeedStatsOverviewProps) {
  const items: MetricStripItem[] = [
    {
      label: "Total Mock Auctions",
      value: stats?.totalMockAuctions ?? 0,
      subtext: "Mock dataset entries",
      icon: Sparkles,
      iconClassName: "text-primary",
    },
    {
      label: "Active (Live)",
      value: stats?.activeCount ?? 0,
      subtext: "Open for bids",
      trendDirection: "up",
      icon: Activity,
      iconClassName: "text-emerald-500",
    },
    {
      label: "Expiring Soon",
      value: stats?.expiringSoonCount ?? 0,
      subtext: "Ends in < 3 hrs",
      trendDirection: "down",
      icon: Flame,
      iconClassName: "text-amber-500",
    },
    {
      label: "Upcoming",
      value: stats?.upcomingCount ?? 0,
      subtext: "Starts in +12h",
      icon: Clock,
      iconClassName: "text-blue-500",
    },
    {
      label: "Past / Ended",
      value: stats?.endedCount ?? 0,
      subtext: "With bid history",
      icon: CheckCircle2,
      iconClassName: "text-slate-400",
    },
    {
      label: "Total Mock Bids",
      value: stats?.totalMockBids ?? 0,
      subtext: "Simulated bids",
      icon: Gavel,
      iconClassName: "text-primary",
    },
  ];

  return <MetricStrip items={items} isLoading={isLoading} className="mb-6" />;
}
