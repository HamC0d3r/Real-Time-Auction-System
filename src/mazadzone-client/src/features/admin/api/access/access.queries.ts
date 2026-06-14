import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppToast } from "@/lib/toast/app-toast";
import { createAdminUserApi, fetchAdminUsersApi } from "./access.api";
import { accessKeys } from "./access.keys";
import type { CreateAdminUserCommand } from "./access.contracts";

/**
 * Hook to retrieve the list of system administrators.
 * Utilizes fetchAdminUsersApi and automatically falls back to an empty array
 * if the request fails, maintaining system stability.
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: accessKeys.all,
    queryFn: async () => {
      try {
        return await fetchAdminUsersApi();
      } catch (error) {
        console.warn("Failed to fetch administrators from backend, falling back to empty list:", error);
        return [];
      }
    },
    staleTime: 30 * 1000, // 30 seconds stale time
  });
}

/**
 * Mutation hook to register a new system administrator.
 * Synchronizes queries upon successful creation and triggers success/error notifications.
 */
export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  return useMutation({
    mutationFn: async (data: CreateAdminUserCommand) => {
      return await createAdminUserApi(data);
    },
    onSuccess: () => {
      // Invalidate the administrators list query
      queryClient.invalidateQueries({ queryKey: accessKeys.all });
      // Invalidate the broader users list to ensure consistency across panels
      queryClient.invalidateQueries({ queryKey: ["admin", "moderate-users"] });
      
      appToast.success(
        "Administrator Created",
        "The new administrative user has been successfully registered."
      );
    },
    onError: (error: Error) => {
      const detailMessage = error?.message || "Failed to create administrator. Please ensure details are correct.";
      appToast.error("Registration Failed", detailMessage);
    },
  });
}
