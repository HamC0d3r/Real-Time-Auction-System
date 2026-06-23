import React from "react";
import { FolderOpen, Gavel, Clock, ShoppingBag, AlertCircle, DollarSign } from "lucide-react";
import type { AdminMetrics } from "../types/admin.types";

export interface MetricCardDefinition {
  title: string;
  metricKey: keyof AdminMetrics;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  iconBgClassName: string;
  isCurrency?: boolean;
}

export const METRIC_CARD_DEFINITIONS: MetricCardDefinition[] = [
  {
    title: "Total Auctions",
    metricKey: "totalAuctions",
    icon: FolderOpen,
    iconClassName: "text-blue-500",
    iconBgClassName: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    title: "Live Auctions",
    metricKey: "liveAuctions",
    icon: Gavel,
    iconClassName: "text-amber-600",
    iconBgClassName: "bg-amber-50 dark:bg-amber-950/20",
  },
  {
    title: "Ending Within 24h",
    metricKey: "endingWithin24h",
    icon: Clock,
    iconClassName: "text-orange-500",
    iconBgClassName: "bg-orange-50 dark:bg-orange-950/20",
  },
  {
    title: "Completed Orders",
    metricKey: "completedOrders",
    icon: ShoppingBag,
    iconClassName: "text-green-600",
    iconBgClassName: "bg-green-50 dark:bg-green-950/20",
  },
  {
    title: "Open Disputes",
    metricKey: "openDisputes",
    icon: AlertCircle,
    iconClassName: "text-red-500",
    iconBgClassName: "bg-red-50 dark:bg-red-950/20",
  },
];
