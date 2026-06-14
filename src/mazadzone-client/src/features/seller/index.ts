/**
 * Seller feature — public API.
 *
 * Handles seller dashboard, become a seller applications,
 * analytics, and seller-specific operations.
 */

// Components
export { BecomeSellerPage } from "./components/BecomeSellerPage";
export { SellerReviewsTab } from "./components/SellerReviewsTab";
export { SellerAuctionsTab } from "./components/SellerAuctionsTab";
export { SellerDashboardPage } from "./components/seller-dashboard/SellerDashboardPage";

// Hooks & API
export {
  useBecomeSeller,
  useSubmitSellerReview,
  useGetSellerProfile,
  useGetSellerReviews,
  useGetSellerProfileAuctions,
  useCreateReviewReply,
  useGetSellerDashboardAuctions,
  useGetSellerDashboardOrders,
  useGetSellerDashboardFinancials,
} from "./api";

// Types
export type { BecomeSellerInput, BecomeSellerResponse, SubmitSellerReviewInput } from "./api";
export type {
  SellerDashboardQueryParams,
  SellerAuctionSummaryDto,
  SellerAuctionsResponse,
  SellerOrderSummaryDto,
  SellerOrdersResponse,
  SellerFinancialsResponse,
} from "./api";
export type { SellerProfile, SellerReview, ReviewReply } from "./types/seller.types";
