/**
 * Disputes feature — public API.
 *
 * TODO: Implement dispute filing, dispute detail view,
 * admin resolution interface, and dispute API hooks.
 */

export { DisputeDialog } from "./components/DisputeDialog";
export { useFileDispute } from "./api/disputes.queries";
export * from "./types/disputes.types";
export * from "./validations/disputes.schemas";
