import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@/lib/toast/app-toast";
import {
  fileDispute,
  fetchDisputeTypes,
  createDisputeTypeApi,
  updateDisputeTypeApi,
  deleteDisputeTypeApi,
  fetchAdminDisputesApi,
  fetchDisputeDetailsApi,
  resolveDisputeApi,
  markDisputeUnderReviewApi,
} from "./disputes.api";
import type { CreateDisputeInput, Dispute } from "../types/disputes.types";
import type {
  DisputeTypeDto,
  CreateDisputeTypeRequest,
  DisputeListItemDto,
  DisputeDetailsDto,
  AdminDisputesQueryParams,
} from "./disputes.contracts";

export const disputeKeys = {
  all: ["disputes"] as const,
  adminList: (params: AdminDisputesQueryParams) =>
    ["disputes", "admin-list", params] as const,
  detail: (id: string) => ["disputes", "detail", id] as const,
  types: ["dispute-types"] as const,
};

/**
 * Mutation to file a dispute for an order.
 */
export function useFileDispute() {
  const queryClient = useQueryClient();

  return useMutation<Dispute, Error, CreateDisputeInput>({
    mutationFn: fileDispute,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.all });
    },
  });
}

/**
 * Query to retrieve configured dispute types.
 */
export function useGetDisputeTypes() {
  return useQuery<DisputeTypeDto[]>({
    queryKey: disputeKeys.types,
    queryFn: fetchDisputeTypes,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation to create a new dispute type classification.
 */
export function useCreateDisputeType() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateDisputeTypeRequest>({
    mutationFn: createDisputeTypeApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.types });
    },
  });
}

export interface UpdateDisputeTypeParams {
  id: string;
  request: CreateDisputeTypeRequest;
}

/**
 * Mutation to update an existing dispute type classification.
 */
export function useUpdateDisputeType() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateDisputeTypeParams>({
    mutationFn: ({ id, request }) => updateDisputeTypeApi(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.types });
    },
  });
}

/**
 * Mutation to soft delete a dispute type classification.
 */
export function useDeleteDisputeType() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteDisputeTypeApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.types });
    },
  });
}

// ─── Admin Disputes Hooks ─────────────────────────────────────────────────────

export interface AdminDisputesFiltersHook {
  search: string;
  status: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  sortColumn?: string;
  isDescending?: boolean;
  page: number;
  pageSize: number;
}

/**
 * Query to fetch paginated disputes list for admin review.
 * Falls back to an empty list on error.
 */
export function useGetAdminDisputes(filters: AdminDisputesFiltersHook) {
  const params: AdminDisputesQueryParams = {
    SearchTerm: filters.search || undefined,
    Status: filters.status !== "All Statuses" ? filters.status : undefined,
    CategoryId: filters.categoryId || undefined,
    FromDate: filters.fromDate || undefined,
    ToDate: filters.toDate || undefined,
    SortColumn: filters.sortColumn || "SubmittedDate",
    IsDescending: filters.isDescending ?? true,
    PageNumber: filters.page,
    PageSize: filters.pageSize,
  };

  return useQuery<DisputeListItemDto[]>({
    queryKey: disputeKeys.adminList(params),
    queryFn: () => fetchAdminDisputesApi(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Query to fetch full details for a single dispute.
 */
export function useGetDisputeDetails(id: string) {
  return useQuery<DisputeDetailsDto>({
    queryKey: disputeKeys.detail(id),
    queryFn: () => fetchDisputeDetailsApi(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation to resolve a dispute as an admin.
 */
export function useResolveDispute() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation<void, Error, { id: string; resolution: string }>({
    mutationFn: ({ id, resolution }) => resolveDisputeApi(id, resolution),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      void queryClient.invalidateQueries({ queryKey: disputeKeys.detail(id) });
      appToast.success("Dispute Resolved", "The dispute has been successfully resolved.");
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to resolve the dispute. Please try again.";
      appToast.error("Action Failed", msg);
    },
  });
}

/**
 * Mutation to mark a dispute as Under Review.
 */
export function useMarkDisputeUnderReview() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation<void, Error, string>({
    mutationFn: (id) => markDisputeUnderReviewApi(id),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      void queryClient.invalidateQueries({ queryKey: disputeKeys.detail(id) });
      appToast.success("Status Updated", "The dispute has been marked as Under Review.");
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to update dispute status. Please try again.";
      appToast.error("Action Failed", msg);
    },
  });
}
