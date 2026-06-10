import { useQuery } from "@tanstack/react-query";
import {
  fetchSummaryStats,
  fetchUserTrust,
  fetchCategoryStats,
  fetchDisputesStats,
  fetchUserGrowthTrend,
  fetchBiddingActivityTrend,
  getDateRangeParams,
} from "./overview.api";
import {
  mapSummaryStats,
  mapUserTrust,
  mapCategoriesStats,
  mapDisputesStats,
  mapUserGrowth,
  mapBiddingActivity,
} from "./overview.mappers";
import { overviewKeys } from "./overview.keys";
import type { AdminDashboardOverviewData, AuctionActivityTrend, UserGrowthTrend, SubcategoryHealthStats, SubcategoryLiveAuctions } from "../../types/admin.types";
import { fetchCategoriesTree } from "../categories/category.api";

export function useGetAdminOverviewStats(period: string) {
  return useQuery<AdminDashboardOverviewData>({
    queryKey: overviewKeys.overview(period),
    queryFn: async () => {
      const calculatedParams = getDateRangeParams(period);
      console.log("[Admin Dashboard Overview Stats] Querying REST endpoints with active parameters:", {
        timeframePeriod: period,
        queryPayload: calculatedParams,
      });

      const [summary, trust, categories, disputes, growth, bidding, categoryTree] = await Promise.all([
        fetchSummaryStats(period),
        fetchUserTrust(period),
        fetchCategoryStats(1000, false),
        fetchDisputesStats(period),
        fetchUserGrowthTrend(period),
        fetchBiddingActivityTrend(period),
        fetchCategoriesTree(),
      ]);

      const metrics = mapSummaryStats(summary);
      const userTrust = mapUserTrust(trust);

      // Roll up active auction counts for each root category by summing its own direct count and all its subcategories' counts
      const statsMap = new Map<string, number>();
      categories.forEach((c) => {
        if (c.id) {
          statsMap.set(c.id, c.activeAuctionsCount);
        }
      });

      const rolledUpRootCategories = categoryTree.map((root) => {
        const directCount = statsMap.get(root.id) || 0;
        const subcategoriesCount = root.subcategories.reduce(
          (sum, sub) => sum + (statsMap.get(sub.id) || 0),
          0
        );
        return {
          id: root.id,
          name: root.name,
          activeAuctionsCount: directCount + subcategoriesCount,
        };
      });

      // Sort root categories by rolled-up active auctions count descending
      rolledUpRootCategories.sort((a, b) => b.activeAuctionsCount - a.activeAuctionsCount);

      const categoryHealth = mapCategoriesStats(rolledUpRootCategories);
      const openDisputesBreakdown = mapDisputesStats(disputes);
      const userGrowth = mapUserGrowth(growth);
      const auctionActivity = mapBiddingActivity(bidding);

      // Build dynamic subcategory health panel using category tree and flat statistics
      const subcategoryLiveAuctions: SubcategoryLiveAuctions[] = [];
      let totalSubcategoryLiveAuctions = 0;

      categoryTree.forEach((root) => {
        (root.subcategories || []).forEach((sub) => {
          const liveAuctionsCount = statsMap.get(sub.id) || 0;
          subcategoryLiveAuctions.push({
            name: sub.name,
            parentCategoryName: root.name,
            liveAuctionsCount,
          });
          totalSubcategoryLiveAuctions += liveAuctionsCount;
        });
      });

      // Sort by active/live auctions count descending and slice to top 6
      subcategoryLiveAuctions.sort((a, b) => b.liveAuctionsCount - a.liveAuctionsCount);
      const topSubcategories = subcategoryLiveAuctions.slice(0, 6);

      const subcategoryHealth: SubcategoryHealthStats = {
        subcategories: topSubcategories,
        totalLiveAuctions: totalSubcategoryLiveAuctions,
        totalLiveAuctionsChangePercent: 0,
        isPositive: true,
      };

      return {
        metrics,
        auctionActivity,
        openDisputesBreakdown,
        userTrust,
        userGrowth,
        categoryHealth,
        subcategoryHealth,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetAuctionActivityTrend(timeframe: string) {
  return useQuery<AuctionActivityTrend>({
    queryKey: overviewKeys.activity(timeframe),
    queryFn: async () => {
      console.log("[Admin Activity Trend] Querying bidding-activity trend endpoint with timeframe:", timeframe);
      const data = await fetchBiddingActivityTrend(timeframe);
      return mapBiddingActivity(data);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetUserGrowthTrend(timeframe: string) {
  return useQuery<UserGrowthTrend>({
    queryKey: overviewKeys.growth(timeframe),
    queryFn: async () => {
      console.log("[Admin Growth Trend] Querying user-growth trend endpoint with timeframe:", timeframe);
      const data = await fetchUserGrowthTrend(timeframe);
      return mapUserGrowth(data);
    },
    staleTime: 5 * 60 * 1000,
  });
}
