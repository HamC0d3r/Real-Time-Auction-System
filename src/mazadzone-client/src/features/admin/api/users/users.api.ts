import { api } from "@/lib/api/client";
import type { ModerateUserRole, ModerateUserStatus } from "../../types/admin.types";
import type { PagedListOfUserDto } from "./users.contracts";
import { mapPagedUsersToViewModel } from "./users.mappers";

export interface UseModerateUsersFilters {
  search: string;
  role: ModerateUserRole | "All Roles";
  status: ModerateUserStatus | "All Statuses";
  sortBy: string;
  page: number;
  pageSize: number;
  joinedDate?: string;
}

export async function fetchModerateUsers(filters: UseModerateUsersFilters) {
  const isAsc = filters.sortBy === "name" ? true : false;

  const response = await api.get<PagedListOfUserDto>("/users/users", {
    params: {
      SearchTerm: filters.search || undefined,
      Role: filters.role !== "All Roles" ? filters.role : undefined,
      Status: filters.status !== "All Statuses" ? filters.status : undefined,
      JoinedAt: filters.joinedDate || undefined,
      SortBy: filters.sortBy === "name" ? "FullName" : "JoinedAt",
      IsAsc: isAsc,
      PageNumber: filters.page,
      PageSize: filters.pageSize,
    },
  });

  return mapPagedUsersToViewModel(response.data);
}

export async function banUserApi(userId: string, reason: string): Promise<void> {
  await api.put(`/users/${userId}/ban`, { reason });
}

export async function suspendUserApi(userId: string, reason: string, until?: string): Promise<void> {
  const suspensionUntil = until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const formattedUntil = suspensionUntil.split(".")[0];
  await api.put(`/users/${userId}/suspend`, { reason, until: formattedUntil });
}

export async function activateUserApi(userId: string): Promise<void> {
  await api.put(`/users/${userId}/activate`);
}

export async function bulkActivateUsersApi(userIds: string[]): Promise<void> {
  await api.put("/users/users/bulk-activate", { userIds });
}

export async function bulkSuspendUsersApi(userIds: string[], reason: string, until?: string): Promise<void> {
  const suspensionUntil = until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const formattedUntil = suspensionUntil.split(".")[0];
  await api.put("/users/bulk-suspend", { userIds, reason, until: formattedUntil });
}

export async function bulkBanUsersApi(userIds: string[], reason: string): Promise<void> {
  await api.put("/users/bulk-ban", { userIds, reason });
}
