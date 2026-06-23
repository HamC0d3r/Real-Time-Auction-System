export interface MetricTrend {
  value: number | string;
  changePercent: number;
  isPositive: boolean;
}

export interface AdminMetrics {
  totalAuctions: MetricTrend;
  liveAuctions: MetricTrend;
  endingWithin24h: MetricTrend;
  completedOrders: MetricTrend;
  openDisputes: MetricTrend;
}

export interface BiddingTrendDataPoint {
  label: string; // e.g., "May 6-12"
  newAuctions: number;
  bidsPlaced: number;
}

export interface AuctionActivityTrend {
  dataPoints: BiddingTrendDataPoint[];
  totalNewAuctions: {
    value: number;
    changePercent: number;
    isPositive: boolean;
  };
  totalBidsPlaced: {
    value: number;
    changePercent: number;
    isPositive: boolean;
  };
}

export interface DisputeBreakdownItem {
  key: string; // e.g., "users-awaiting-verification"
  name: string;
  count: number;
  changePercent: number;
  isPositive: boolean;
}

export interface OpenDisputesBreakdown {
  totalItems: number;
  queues: DisputeBreakdownItem[];
}

export interface VerificationWorkflowStep {
  step: number;
  name: string;
  count: number;
}

export interface AccountStatusItem {
  status: string;
  count: number;
  percentage: number;
  color: string; // color mapping key, e.g. "success", "upcoming", "warning", "info"
}

export interface UserTrustStats {
  workflowSteps: VerificationWorkflowStep[];
  accountStatusOverview: AccountStatusItem[];
  trustScore: number;
  trustScoreChangePercent: number;
  isPositive: boolean;
}

export interface UserGrowthDataPoint {
  label: string; // e.g., "May 6-12"
  newUsers: number;
  newSellers: number;
}

export interface UserGrowthTrend {
  dataPoints: UserGrowthDataPoint[];
  totalNewUsers: {
    value: number;
    changePercent: number;
    isPositive: boolean;
  };
  totalNewSellers: {
    value: number;
    changePercent: number;
    isPositive: boolean;
  };
}

export interface CategoryLiveAuctions {
  name: string;
  liveAuctionsCount: number;
}

export interface CategoryHealthStats {
  categories: CategoryLiveAuctions[];
  totalLiveAuctions: number;
  totalLiveAuctionsChangePercent: number;
  isPositive: boolean;
}

export interface SubcategoryLiveAuctions {
  name: string;
  parentCategoryName: string;
  liveAuctionsCount: number;
}

export interface SubcategoryHealthStats {
  subcategories: SubcategoryLiveAuctions[];
  totalLiveAuctions: number;
  totalLiveAuctionsChangePercent: number;
  isPositive: boolean;
}

export interface AdminDashboardOverviewData {
  metrics: AdminMetrics;
  auctionActivity: AuctionActivityTrend;
  openDisputesBreakdown: OpenDisputesBreakdown;
  userTrust: UserTrustStats;
  userGrowth: UserGrowthTrend;
  categoryHealth: CategoryHealthStats;
  subcategoryHealth: SubcategoryHealthStats;
}

export type ModerateUserRole = "Bidder" | "Seller" | "Admin";
export type ModerateUserStatus = "Active" | "Suspended" | "Banned";

export interface ModerateUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: ModerateUserRole;
  status: ModerateUserStatus;
  activity: {
    auctions: number;
    bids: number;
  };
  joinedDate: string; // ISO date string
  lastActive: string; // "Today 10:24 AM", "Yesterday 6:47 PM", etc.
}

// ─── Auction Moderation Types ─────────────────────────────────────────────

export type AuctionStatus = "Active" | "Pending" | "Ended" | "Cancelled";

export interface ModerateAuction {
  id: string;
  title: string;
  imageUrl?: string;
  sellerName: string;
  sellerEmail: string;
  category: string;
  status: AuctionStatus;
  currentBid: number;
  currency: string;
  bidCount: number;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}

export interface ModerateAuctionsResponse {
  data: ModerateAuction[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ModerateUsersResponse {
  data: ModerateUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

