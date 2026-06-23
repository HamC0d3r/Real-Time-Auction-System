import type {
  AdminMetrics,
  UserGrowthTrend,
  UserTrustStats,
  AuctionActivityTrend,
  CategoryHealthStats,
  OpenDisputesBreakdown,
} from "../../types/admin.types";
import type {
  SummaryStatsResponse,
  UserGrowthStatsResponse,
  UserTrustResponse,
  BiddingActivityResponse,
  BackendCategoryStat,
  OpenDisputesBreakdownResponse,
} from "./overview.contracts";

export function mapSummaryStats(summary: SummaryStatsResponse): AdminMetrics {
  return {
    totalAuctions: {
      value: summary.totalAuctions.value,
      changePercent: summary.totalAuctions.percentageChange,
      isPositive: summary.totalAuctions.percentageChange >= 0,
    },
    liveAuctions: {
      value: summary.liveAuctions.value,
      changePercent: summary.liveAuctions.percentageChange,
      isPositive: summary.liveAuctions.percentageChange >= 0,
    },
    endingWithin24h: {
      value: summary.endingWithin24h.value,
      changePercent: summary.endingWithin24h.percentageChange,
      isPositive: summary.endingWithin24h.percentageChange >= 0,
    },
    completedOrders: {
      value: summary.completedOrders.value,
      changePercent: summary.completedOrders.percentageChange,
      isPositive: summary.completedOrders.percentageChange >= 0,
    },
    openDisputes: {
      value: summary.openDisputes.value,
      changePercent: summary.openDisputes.percentageChange,
      isPositive: summary.openDisputes.percentageChange >= 0,
    },
  };
}

export function mapUserGrowth(growth: UserGrowthStatsResponse): UserGrowthTrend {
  return {
    dataPoints: growth.chartData.map((d) => ({
      label: d.label,
      newUsers: d.newUsers,
      newSellers: d.newSellers,
    })),
    totalNewUsers: {
      value: growth.totalNewUsers,
      changePercent: growth.usersGrowthPercentage,
      isPositive: growth.usersGrowthPercentage >= 0,
    },
    totalNewSellers: {
      value: growth.totalNewSellers,
      changePercent: growth.sellersGrowthPercentage,
      isPositive: growth.sellersGrowthPercentage >= 0,
    },
  };
}

export function mapUserTrust(trust: UserTrustResponse): UserTrustStats {
  return {
    workflowSteps: [
      { step: 1, name: "Registered Users", count: trust.totalRegisteredUsers },
      { step: 2, name: "Seller Enabled", count: trust.totalSellersEnabled },
    ],
    accountStatusOverview: [
      {
        status: "Active Accounts",
        count: trust.statusOverview.active.count,
        percentage: trust.statusOverview.active.percentage,
        color: "success",
      },
      {
        status: "Suspended Accounts",
        count: trust.statusOverview.suspended.count,
        percentage: trust.statusOverview.suspended.percentage,
        color: "warning",
      },
      {
        status: "Banned Accounts",
        count: trust.statusOverview.banned.count,
        percentage: trust.statusOverview.banned.percentage,
        color: "destructive",
      },
    ],
    trustScore: trust.trustScore.score,
    trustScoreChangePercent: trust.trustScore.percentageChange,
    isPositive: trust.trustScore.percentageChange >= 0,
  };
}

export function mapBiddingActivity(activity: BiddingActivityResponse): AuctionActivityTrend {
  return {
    dataPoints: activity.chartData.map((d) => ({
      label: d.label,
      newAuctions: d.newAuctions,
      bidsPlaced: d.bidsPlaced,
    })),
    totalNewAuctions: {
      value: activity.totalNewAuctions,
      changePercent: activity.auctionsGrowthPercentage,
      isPositive: activity.auctionsGrowthPercentage >= 0,
    },
    totalBidsPlaced: {
      value: activity.totalBidsPlaced,
      changePercent: activity.bidsGrowthPercentage,
      isPositive: activity.bidsGrowthPercentage >= 0,
    },
  };
}

export function mapCategoriesStats(categories: BackendCategoryStat[]): CategoryHealthStats {
  const sumLive = categories.reduce((acc, curr) => acc + curr.activeAuctionsCount, 0);
  return {
    categories: categories.map((c) => ({
      name: c.name,
      liveAuctionsCount: c.activeAuctionsCount,
    })),
    totalLiveAuctions: sumLive,
    totalLiveAuctionsChangePercent: 0,
    isPositive: true,
  };
}

export function mapDisputesStats(disputes: OpenDisputesBreakdownResponse): OpenDisputesBreakdown {
  return {
    totalItems: disputes.totalOpenCases,
    queues: disputes.breakdown.map((b) => ({
      key: b.typeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: b.typeName,
      count: b.cases,
      changePercent: b.percentageChange,
      isPositive: b.percentageChange >= 0,
    })),
  };
}
