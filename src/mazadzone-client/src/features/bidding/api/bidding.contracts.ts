/**
 * Local contract representations of backend API contracts for the Bidding feature.
 *
 * These types match the ASP.NET Core OpenAPI contract exactly.
 */

export interface MyBidAuctionDto {
  auctionId: string;
  imageUrl: string;
  itemTitle: string;
  yourBidAmount: number;
  currentBidAmount: number;
  auctionStatus: string;
  yourBidStatus: string;
  startTime: string;
  endTime: string;
  bidsCount: number;
}

export interface GetMyBidsQueryParams {
  page?: number;
  pageSize?: number;
  query?: string;
  categoryId?: string;
  tab?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface PlaceBidRequestDto {
  methodId: string;
  amount: number;
}

export interface PagedListOfMyBidAuctionDto {
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  totalCount: number;
  items: MyBidAuctionDto[];
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}
