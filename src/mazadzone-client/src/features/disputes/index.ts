/**
 * Disputes feature — public API.
 */

export { DisputeDialog } from "./components/DisputeDialog";
export { useFileDispute } from "./api";
export * from "./types/disputes.types";
export * from "./validations/disputes.schemas";

// Admin
export { AdminDisputesPage } from "./components/AdminDisputesPage";
export * from "./types/admin-disputes.types";
export {
  useGetAdminDisputes,
  useGetDisputeDetails,
  useResolveDispute,
  useMarkDisputeUnderReview,
} from "./api/disputes.queries";

