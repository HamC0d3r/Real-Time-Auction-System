import type { ImageModelDto } from "@/features/auctions/api/auction.contracts";

/**
 * Local contract representations of backend API contracts for the Disputes feature.
 */

export interface OpenDisputeRequest {
  orderId: string;
  disputeTypeId: string;
  title: string;
  description: string;
  images?: ImageModelDto[] | null;
}

export interface ResolveDisputeRequest {
  resolution: string;
}

export interface DisputeTypeDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreateDisputeTypeRequest {
  name: string;
  description: string;
}

// ─── Admin Disputes API Contracts ───────────────────────────────────────────

/**
 * Matches DisputeListItemDto from the OpenAPI contract.
 * Returned by GET /api/v1/disputes (paginated array).
 */
export interface DisputeListItemDto {
  id: string;
  bidderName: string;
  sellerName: string;
  category: string;
  status: string;
  submittedDate: string; // date-time
}

/**
 * Query parameters accepted by GET /api/v1/disputes.
 */
export interface AdminDisputesQueryParams {
  SearchTerm?: string;
  Status?: string;
  CategoryId?: string; // UUID of the dispute type
  FromDate?: string;   // date-time
  ToDate?: string;     // date-time
  SortColumn?: string;
  IsDescending?: boolean;
  PageNumber?: number;
  PageSize?: number;
}

// ─── Dispute Details DTO ─────────────────────────────────────────────────────

export interface AuctionDisputeInfo {
  id: string;
  title: string;
  finalPrice?: number;
  endTime?: string;
  mainImageUrl?: string;
}

export interface DisputeUserDto {
  id: string;
  name: string;
  email: string;
}

export interface DisputePartiesDto {
  bidder: DisputeUserDto;
  seller: DisputeUserDto;
}

export interface DisputeAttachmentDto {
  path: string;
  altText: string;
}

/**
 * Matches DisputeDetailsDto from the OpenAPI contract.
 * Returned by GET /api/v1/disputes/{id}.
 */
export interface DisputeDetailsDto {
  id: string;
  status: string;
  disputeType: string;
  title: string;
  description: string;
  auctionDetails: AuctionDisputeInfo;
  parties: DisputePartiesDto[];
  attachments: DisputeAttachmentDto[];
}

