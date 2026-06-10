/**
 * Pure mapping functions for the Admin Auctions feature.
 * Decouples raw backend DTO contracts from client-side UI ViewModels.
 */

import type { ModerateAuction, ModerateAuctionsResponse, AuctionStatus } from "../../types/admin.types";
import type { AuctionsListDto, PagedListOfAuctionsListDto, GetAuctionsQueryParams } from "./auctions.contracts";
import type { UseModerateAuctionsFilters } from "./auctions.api";

/**
 * Maps frontend UI filters to backend query parameters with correct field mappings.
 */
export function mapFiltersToQueryParams(filters: UseModerateAuctionsFilters): GetAuctionsQueryParams {
  let backendStatus: string | undefined = undefined;
  if (filters.status && filters.status !== "All Statuses") {
    backendStatus = filters.status;
  }

  let backendCategoryId: string | undefined = undefined;
  if (filters.category && filters.category !== "All Categories") {
    backendCategoryId = filters.category;
  }

  // Map UI sorting parameters to backend expected fields
  let backendSortBy: string | undefined = undefined;
  let backendSortDirection = filters.sortOrder || "desc";

  if (filters.sortBy === "dateCreated") {
    backendSortBy = "StartTime";
  } else if (filters.sortBy === "currentBid") {
    backendSortBy = "CurrentBidAmount";
  } else if (filters.sortBy === "bidCount") {
    backendSortBy = "BidsCount";
  } else if (filters.sortBy === "endDate") {
    backendSortBy = "EndTime";
  }

  return {
    Page: filters.page,
    PageSize: filters.pageSize,
    SearchTerm: filters.search || undefined,
    CategoryId: backendCategoryId,
    Status: backendStatus,
    SortBy: backendSortBy,
    SortDirection: backendSortDirection,
  };
}

/**
 * Normalizes backend status strings into stable frontend AuctionStatus enums.
 */
export function mapBackendStatusToAuctionStatus(status?: string): AuctionStatus {
  if (!status) return "Active";
  const normalized = status.toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "upcoming" || normalized === "pending") return "Pending";
  if (
    normalized === "ended" ||
    normalized === "endedsold" ||
    normalized === "endedunsold"
  ) {
    return "Ended";
  }
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";
  return "Active";
}

/**
 * Maps a single AuctionsListDto item from the backend into a ModerateAuction UI shape.
 */
export function mapAuctionsListDtoToModerateAuction(dto: AuctionsListDto): ModerateAuction {
  const shortId = dto.id.substring(0, 4);

  return {
    id: dto.id,
    title: dto.itemTitle,
    imageUrl: dto.imageUrl || undefined,
    sellerName: `Seller ${shortId}`,
    sellerEmail: `seller.${shortId}@mazadzone.com`,
    category: "Tech & Electronics", // Consistent default matching the main client-side auctions list
    status: mapBackendStatusToAuctionStatus(dto.status),
    currentBid: dto.currentBidAmount,
    currency: "JOD",
    bidCount: dto.bidsCount || 0,
    startDate: dto.startTime,
    endDate: dto.endTime,
  };
}

/**
 * Maps a paginated backend PagedListOfAuctionsListDto response to ModerateAuctionsResponse.
 */
export function mapPagedAuctionsListToModerateAuctionsResponse(
  pagedDto: PagedListOfAuctionsListDto,
  page: number,
  pageSize: number
): ModerateAuctionsResponse {
  const items = pagedDto.items || [];
  return {
    data: items.map(mapAuctionsListDtoToModerateAuction),
    totalCount: pagedDto.totalCount,
    page: page,
    pageSize: pageSize,
    totalPages: pagedDto.totalPages || Math.ceil(pagedDto.totalCount / pageSize),
  };
}
