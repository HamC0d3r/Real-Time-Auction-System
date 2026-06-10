import { api } from "@/lib/api/client";
import type {
  SummaryStatsResponse,
  UserTrustResponse,
  BackendCategoryStat,
  OpenDisputesBreakdownResponse,
  UserGrowthStatsResponse,
  BiddingActivityResponse,
} from "./overview.contracts";

export function getDateRangeParams(period: string) {
  const endDate = new Date();
  const startDate = new Date();
  let apiPeriod = "Week";

  const normalized = period.toLowerCase();

  switch (normalized) {
    case "day":
    case "7":
      startDate.setDate(endDate.getDate() - 7);
      apiPeriod = "Day";
      break;
    case "week":
    case "30":
      startDate.setDate(endDate.getDate() - 30);
      apiPeriod = "Week";
      break;
    case "month":
      startDate.setFullYear(endDate.getFullYear() - 1); // 1 year of monthly data
      apiPeriod = "Month";
      break;
    case "90":
      startDate.setDate(endDate.getDate() - 90);
      apiPeriod = "Month";
      break;
    case "quarter":
      startDate.setFullYear(endDate.getFullYear() - 3); // 3 years of quarterly data
      apiPeriod = "Quarter";
      break;
    case "year":
      startDate.setFullYear(endDate.getFullYear() - 5); // 5 years of yearly data
      apiPeriod = "Year";
      break;
    case "5years":
      startDate.setFullYear(endDate.getFullYear() - 5);
      apiPeriod = "Year";
      break;
    default:
      startDate.setDate(endDate.getDate() - 30);
      apiPeriod = "Week";
      break;
  }

  // Format exactly as yyyy-MM-ddTHH:mm:ss
  const startIso = startDate.toISOString().split(".")[0];
  const endIso = endDate.toISOString().split(".")[0];

  return {
    startDate: startIso,
    endDate: endIso,
    period: apiPeriod, // Must be: Day, Week, Month, Quarter, or Year
  };
}

export async function fetchSummaryStats(period: string): Promise<SummaryStatsResponse> {
  const response = await api.get<SummaryStatsResponse>(`/dashboard/statistics`, {
    params: getDateRangeParams(period),
  });
  return response.data;
}

export async function fetchUserTrust(period: string): Promise<UserTrustResponse> {
  const response = await api.get<UserTrustResponse>(`/dashboard/user-trust`, {
    params: getDateRangeParams(period),
  });
  return response.data;
}

export async function fetchCategoryStats(): Promise<BackendCategoryStat[]> {
  const response = await api.get<BackendCategoryStat[]>(`/categories/category-statistics`);
  return response.data;
}

export async function fetchDisputesStats(period: string): Promise<OpenDisputesBreakdownResponse> {
  const response = await api.get<OpenDisputesBreakdownResponse>(`/dashboard/disputes/breakdown`, {
    params: getDateRangeParams(period),
  });
  return response.data;
}

export async function fetchUserGrowthTrend(period: string): Promise<UserGrowthStatsResponse> {
  const response = await api.get<UserGrowthStatsResponse>(`/dashboard/users/growth`, {
    params: getDateRangeParams(period),
  });
  return response.data;
}

export async function fetchBiddingActivityTrend(period: string): Promise<BiddingActivityResponse> {
  const response = await api.get<BiddingActivityResponse>(`/dashboard/auctions/trends`, {
    params: getDateRangeParams(period),
  });
  return response.data;
}
