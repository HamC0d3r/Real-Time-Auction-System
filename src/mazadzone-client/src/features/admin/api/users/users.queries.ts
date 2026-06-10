import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAppToast } from "@/lib/toast/app-toast";
import {
  fetchModerateUsers,
  banUserApi,
  suspendUserApi,
  activateUserApi,
  bulkActivateUsersApi,
  bulkSuspendUsersApi,
  bulkBanUsersApi,
  type UseModerateUsersFilters,
} from "./users.api";
import { usersKeys } from "./users.keys";

export function useModerateUsers(filters: UseModerateUsersFilters) {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => fetchModerateUsers(filters),
    staleTime: 60 * 1000,
  });
}

export interface SuspendUserParams {
  userId: string;
  reason: string;
  until?: string;
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation({
    mutationFn: async ({ userId, reason, until }: SuspendUserParams) => {
      await suspendUserApi(userId, reason, until);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      appToast.success("User Suspended", "The user account has been successfully suspended.");
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Failed to suspend the user. Please try again.";
      appToast.error("Action Failed", msg);
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      await banUserApi(userId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      appToast.success("User Banned", "The user account has been successfully banned.");
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Failed to ban the user. Please try again.";
      appToast.error("Action Failed", msg);
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      await activateUserApi(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      appToast.success("User Restored", "The user account has been successfully restored to Active status.");
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Failed to restore the user. Please try again.";
      appToast.error("Action Failed", msg);
    },
  });
}

export async function exportUsersApi(filters: UseModerateUsersFilters, selectedIds: string[]): Promise<Blob> {
  if (selectedIds.length > 0) {
    const response = await api.post<Blob>("/users/users/export/selected", selectedIds, {
      responseType: "blob",
    });
    return response.data;
  }

  const isAsc = filters.sortBy === "name" ? true : false;
  const response = await api.get<Blob>("/users/users/export", {
    params: {
      SearchTerm: filters.search || undefined,
      Role: filters.role !== "All Roles" ? filters.role : undefined,
      Status: filters.status !== "All Statuses" ? filters.status : undefined,
      JoinedAt: filters.joinedDate || undefined,
      SortBy: filters.sortBy === "name" ? "FullName" : "JoinedAt",
      IsAsc: isAsc,
    },
    responseType: "blob",
  });
  return response.data;
}

export interface BulkSuspendUsersParams {
  userIds: string[];
  reason: string;
  until?: string;
}

export function useBulkSuspendUsers() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation({
    mutationFn: async ({ userIds, reason, until }: BulkSuspendUsersParams) => {
      await bulkSuspendUsersApi(userIds, reason, until);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      appToast.success("Users Suspended", `Successfully suspended ${variables.userIds.length} user accounts.`);
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Failed to bulk suspend the selected users.";
      appToast.error("Bulk Suspension Failed", msg);
    },
  });
}

export function useBulkBanUsers() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation({
    mutationFn: async ({ userIds, reason }: { userIds: string[]; reason: string }) => {
      await bulkBanUsersApi(userIds, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      appToast.success("Users Banned", `Successfully banned ${variables.userIds.length} user accounts.`);
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Failed to bulk ban the selected users.";
      appToast.error("Bulk Ban Failed", msg);
    },
  });
}

export function useBulkActivateUsers() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      await bulkActivateUsersApi(userIds);
    },
    onSuccess: (_, userIds) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      appToast.success("Users Activated", `Successfully activated ${userIds.length} user accounts.`);
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : "Failed to bulk activate the selected users.";
      appToast.error("Bulk Activation Failed", msg);
    },
  });
}
