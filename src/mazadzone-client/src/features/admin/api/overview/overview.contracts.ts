export interface MetricDetail {
  value: number;
  percentageChange: number;
}

export interface SummaryStatsResponse {
  totalAuctions: MetricDetail;
  liveAuctions: MetricDetail;
  endingWithin24h: MetricDetail;
  completedOrders: MetricDetail;
  openDisputes: MetricDetail;
}

export interface UserGrowthPoint {
  label: string;
  newUsers: number;
  newSellers: number;
}

export interface UserGrowthStatsResponse {
  totalNewUsers: number;
  usersGrowthPercentage: number;
  totalNewSellers: number;
  sellersGrowthPercentage: number;
  maxUsersPoint: number;
  maxSellersPoint: number;
  chartData: UserGrowthPoint[];
}

export interface AccountStatusDetail {
  count: number;
  percentage: number;
}

export interface UserTrustResponse {
  totalRegisteredUsers: number;
  totalSellersEnabled: number;
  statusOverview: {
    active: AccountStatusDetail;
    suspended: AccountStatusDetail;
    banned: AccountStatusDetail;
  };
  trustScore: {
    score: number;
    percentageChange: number;
  };
}

export interface BiddingTrendPoint {
  label: string;
  newAuctions: number;
  bidsPlaced: number;
}

export interface BiddingActivityResponse {
  totalNewAuctions: number;
  auctionsGrowthPercentage: number;
  totalBidsPlaced: number;
  bidsGrowthPercentage: number;
  maxAuctionsPoint: number;
  maxBidsPoint: number;
  chartData: BiddingTrendPoint[];
}

export interface BackendCategoryStat {
  id: string;
  name: string;
  activeAuctionsCount: number;
}

export interface DisputeBreakdownItemDto {
  typeName: string;
  cases: number;
  percentageChange: number;
}

export interface OpenDisputesBreakdownResponse {
  totalOpenCases: number;
  breakdown: DisputeBreakdownItemDto[];
}
