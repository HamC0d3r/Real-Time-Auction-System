/**
 * Pure mapping functions for the Auctions feature.
 * Decouples raw backend DTO contracts from client-side UI ViewModels.
 */

import { parseUtcDate } from "@/utils/date.utils";
import { useAuthStore } from "@/stores/auth.store";
import type {
  AuctionFilters,
  AuctionSummary,
  AuctionStatus,
  CreateAuctionInput,
  AuctionCondition,
} from "../types/auction.types";
import type {
  AuctionDto,
  AuctionsListDto,
  CreateAuctionRequest,
  GetAuctionsQueryParams,
} from "./auction.contracts";

/**
 * Maps frontend UI filters to backend PascalCase query parameters.
 */
export function mapFiltersToQueryParams(
  filters?: AuctionFilters,
): GetAuctionsQueryParams {
  let statusParam: string | undefined = filters?.status;
  if (statusParam === "Upcoming") {
    statusParam = "Pending";
  }

  let itemStatusParam: string | undefined = filters?.condition;
  if (itemStatusParam === "Like New") {
    itemStatusParam = "LikeNew";
  }

  return {
    Page: filters?.page ?? 1,
    PageSize: filters?.pageSize ?? 12,
    SearchTerm: filters?.search || undefined,
    CategoryId: filters?.category || undefined,
    SubCategoryId: filters?.subcategory || undefined,
    MinCurrentBid: filters?.minPrice || undefined,
    MaxCurrentBid: filters?.maxPrice || undefined,
    Status: statusParam || undefined,
    SortBy: filters?.sortBy || undefined,
    SortDirection: filters?.sortDirection || undefined,
    ItemStatus: itemStatusParam || undefined,
  };
}

/**
 * Helper to normalize backend status strings into stable UI values.
 */
function mapBackendStatusToAuctionStatus(status?: string): AuctionStatus {
  if (!status) return "Active";
  const normalized = status.toLowerCase();
  if (normalized === "active") return "Active";
  if (normalized === "upcoming" || normalized === "pending") return "Upcoming";
  if (
    normalized === "ended" ||
    normalized === "endedsold" ||
    normalized === "endedunsold" ||
    normalized === "cancelled"
  ) {
    return "Ended";
  }
  return "Active";
}

/**
 * Normalizes backend condition strings to UI-friendly AuctionCondition values.
 * e.g. "LikeNew", "Like_New", "LIKE_NEW", "like-new", "Like New" -> "Like New"
 */
export function mapBackendConditionToAuctionCondition(
  cond?: string,
): AuctionCondition {
  if (!cond) return "New";
  const normalized = cond.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (normalized === "new") return "New";
  if (normalized === "likenew") return "Like New";
  if (normalized === "good") return "Good";
  if (normalized === "fair") return "Fair";
  return "New";
}

/**
 * Maps raw AuctionsListDto from a search or list request into an AuctionSummary card ViewModel.
 */
export function mapAuctionsListDtoToSummary(
  dto: AuctionsListDto,
): AuctionSummary {
  return {
    id: dto.id,
    title: dto.itemTitle,
    imageUrl: dto.imageUrl,
    category: "Tech and Electronics",
    subcategory: "Others",
    condition: mapBackendConditionToAuctionCondition(dto.itemStatus),
    description: "",
    conditionDescription: dto.condtion || "",
    status: mapBackendStatusToAuctionStatus(dto.status),
    pricing: {
      startingPrice: dto.currentBidAmount,
      currentBid: dto.currentBidAmount > 0 ? dto.currentBidAmount : null,
      bidCount: dto.bidsCount,
    },
    timing: {
      startDate: parseUtcDate(dto.startTime),
      endDate: parseUtcDate(dto.endTime),
      creationDate: dto.startTime,
    },
    isFavorite: false,
    isOwner: false,
    images: dto.imageUrl ? [dto.imageUrl] : [],
    bidHistory: [],
  };
}

/**
 * Maps raw AuctionDto from a detailed request into an AuctionSummary ViewModel.
 */
export function mapAuctionDtoToSummary(dto: AuctionDto): AuctionSummary {
  return {
    id: dto.id,
    title: dto.itemTitle,
    imageUrl: dto.imageUrls?.[0] ?? "",
    category: "Tech and Electronics",
    subcategory: "Others",
    condition: mapBackendConditionToAuctionCondition(dto.status),
    description: dto.itemDescription || "",
    conditionDescription: dto.condition || "",
    status: mapBackendStatusToAuctionStatus(dto.auctionStatus),
    pricing: {
      startingPrice: dto.startBidAmount,
      currentBid: dto.currentBidAmount > 0 ? dto.currentBidAmount : null,
      bidCount: dto.bids?.length ?? 0,
      minimumIncrement: dto.minBidAmount ?? 10,
    },
    timing: {
      startDate: parseUtcDate(dto.startTime),
      endDate: parseUtcDate(dto.endTime),
      creationDate: dto.startTime,
    },
    isFavorite: false,
    isOwner: false,
    images: dto.imageUrls ?? [],
    bidHistory: (dto.bids ?? []).map((b, idx) => ({
      id: `${dto.id}-bid-${idx}`,
      bidderName: `Bidder ${b.bidderId.substring(0, 4)}`,
      bidderInitial: "B",
      amount: b.amount,
      timeAgo: new Date(b.timestamp).toLocaleDateString(),
      isHighest: idx === 0,
      bidderId: b.bidderId,
    })),
    seller: {
      id: dto.sellerEmail === useAuthStore.getState().user?.email
        ? useAuthStore.getState().user?.id || "seller-id-placeholder"
        : "seller-id-placeholder",
      email: dto.sellerEmail,
      fullName: dto.sellerName,
      role: "seller",
      isVerified: dto.sellerRating >= 4.0,
      avatarInitial: dto.sellerName ? dto.sellerName.charAt(0) : "S",
      reviews: dto.reviewCount,
      rating: dto.sellerRating,
    },
  };
}

/**
 * Helper to convert local time strings from the form directly into timezone-agnostic local ISO strings
 * matching the exact shape: "YYYY-MM-DDTHH:mm:ss".
 */
export function convertLocalToUtcIsoString(localDateTimeStr: string): string {
  if (!localDateTimeStr) return "";
  
  // localDateTimeStr is in the format "YYYY/MM/DD HH:mm" or "YYYY-MM-DDTHH:mm"
  const clean = localDateTimeStr.replace(/\//g, "-").replace(" ", "T");
  const [datePart, timePart] = clean.split("T");
  if (!datePart || !timePart) {
    return clean;
  }
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    return clean;
  }

  // Construct Date object in browser local time
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  // Convert to UTC ISO string (which includes the Z offset)
  return localDate.toISOString();
}

/**
 * Maps creation form input values into a backend CreateAuctionRequest DTO payload.
 */
export function mapCreateAuctionInputToRequest(
  input: CreateAuctionInput,
): CreateAuctionRequest {
  const addressParts = (input.shippingLocation || "Amman, Main St, 1").split(",");
  const city = addressParts[0]?.trim() || "Amman";
  const street = addressParts[1]?.trim() || "Main St";
  const building = addressParts[2]?.trim()?.replace(/Bldg\s+/i, "") || "1";

  return {
    shippingAddress: {
      city,
      street,
      building,
      landmark: "Registered Location",
    },
    startBidAmount: input.startingPrice,
    minBidAmount: input.minimumIncrement || 1,
    startTime: convertLocalToUtcIsoString(input.startDate),
    endTime: convertLocalToUtcIsoString(input.endDate),
    title: input.title,
    description: input.description,
    images: (input.images || []).map((file, idx) => ({
      path: typeof file === "string" ? file : file.name,
      altText: input.title,
      isMain: idx === 0,
    })),
    catigoryId: input.subcategory || input.category || "cat-1",
    status: input.condition,
    condition: input.conditionDescription,
  };
}
