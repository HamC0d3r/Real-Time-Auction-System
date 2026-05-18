/**
 * Seller feature — public API.
 *
 * Handles seller dashboard, become a seller applications,
 * analytics, and seller-specific operations.
 */

export { BecomeSellerPage } from "./components/BecomeSellerPage";
export { useBecomeSeller } from "./api/seller.mutations";
export type { BecomeSellerInput, BecomeSellerResponse } from "./api/seller.mutations";
