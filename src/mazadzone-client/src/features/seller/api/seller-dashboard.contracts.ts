/**
 * Local contract representations of backend API contracts for the Seller Dashboard feature.
 *
 * These types match the ASP.NET Core OpenAPI contract exactly.
 */

export interface SellerDashboardQueryParams {
  Status?: string;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
  DateFrom?: string;
  DateTo?: string;
  Page: number;
  PageSize: number;
}

export interface SellerAuctionSummaryDto {
  auctionId: string;
  title: string;
  category: string;
  status: string;
  bidsCount: number;
  lastBidAmount: number;
  endDateUtc: string;
  thumbnailUrl: string | null;
}

export interface SellerAuctionsResponse {
  activeAuctions: number;
  pending: number;
  soldItems: number;
  unsold: number;
  totalCount: number;
  auctions: SellerAuctionSummaryDto[];
}

export interface SellerOrderSummaryDto {
  orderId: string;
  auctionId: string;
  auctionTitle: string;
  orderStatus: string;
  orderDateUtc: string;
  totalAmount: number;
  bidderName: string;
}

export interface SellerOrdersResponse {
  totalCount: number;
  orders: SellerOrderSummaryDto[];
}

export interface SellerFinancialsResponse {
  totalGrossRevenue: number;
  totalPlatformFees: number;
  totalNetProfit: number;
  completedOrdersCount: number;
}

