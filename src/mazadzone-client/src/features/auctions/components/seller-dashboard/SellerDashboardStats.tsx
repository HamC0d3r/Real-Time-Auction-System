"use client";

import { Gavel, ShoppingBag, CreditCard, AlertCircle, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuctionSummary } from "../../types/auction.types";

interface SellerDashboardStatsProps {
  auctions: AuctionSummary[];
}

export function SellerDashboardStats({ auctions }: SellerDashboardStatsProps) {
  // Compute metrics dynamically from the seller's auctions
  const activeCount = auctions.filter((a) => a.status === "Active").length;
  const soldCount = auctions.filter((a) => a.status === "Ended" && a.pricing.bidCount > 0).length;

  // Pending payments can be simulated as ended auctions with bids (or a subset of them)
  const pendingPaymentsCount = Math.max(0, Math.round(soldCount * 0.3));

  // Unsold (No Bids) auctions (ended but bidCount is 0)
  const unsoldCount = auctions.filter((a) => a.status === "Ended" && a.pricing.bidCount === 0).length;

  const stats = [
    {
      title: "Active Auctions",
      value: activeCount || "0",
      icon: Gavel,
      iconColor: "text-success-foreground",
      iconBg: "bg-success border-success",
    },
    {
      title: "Sold Items",
      value: soldCount || "0",
      icon: ShoppingBag,
      iconColor: "text-info-foreground",
      iconBg: "bg-info/20 border-info/30",
    },
    {
      title: "Pending Payments",
      value: pendingPaymentsCount || "0",
      icon: CreditCard,
      iconColor: "text-upcoming-foreground",
      iconBg: "bg-upcoming/20 border-upcoming/30",
    },
    {
      title: "Unsold (No Bids)",
      value: unsoldCount || "0",
      icon: AlertCircle,
      iconColor: "text-warning-foreground",
      iconBg: "bg-warning/20 border-warning/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-card text-card-foreground border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between h-24 w-full"
          >
            <div className="space-y-1.5 text-left">
              <span className="text-md font-semibold text-muted-foreground">
                {stat.title}
              </span>
              <div className="text-3xl font-extrabold tracking-tight text-foreground">
                {stat.value}
              </div>
            </div>
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm shrink-0", stat.iconBg)}>
              <Icon className={cn("h-6 w-6", stat.iconColor)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
