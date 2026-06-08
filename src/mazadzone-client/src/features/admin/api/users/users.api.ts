import { api } from "@/lib/api/client";
import type { ModerateUser, ModerateUsersResponse, ModerateUserRole, ModerateUserStatus } from "../../types/admin.types";
import type { PagedListOfUserDto } from "./users.contracts";
import { mapPagedUsersToViewModel } from "./users.mappers";

// --- Persistent Mock Users Database for fallback ---
const generateMockUsers = (): ModerateUser[] => {
  const roles: ModerateUserRole[] = ["Bidder", "Seller", "Admin"];
  const baseUsers = [
    { fullName: "Ahmad Khan", email: "ahmad.khan@email.com" },
    { fullName: "Sara Ali", email: "sara.ali@email.com" },
    { fullName: "Bilal Hussain", email: "bilal.hussain@email.com" },
    { fullName: "Ayesha Malik", email: "ayesha.malik@email.com" },
    { fullName: "Usman Tariq", email: "usman.tariq@email.com" },
    { fullName: "Hassan Raza", email: "hassan.raza@email.com" },
    { fullName: "Zainab Fatima", email: "zainab.fatima@email.com" },
    { fullName: "Faisal Noor", email: "faisal.noor@email.com" },
    { fullName: "Imran Siddiqui", email: "imran.siddiqui@email.com" },
    { fullName: "Nida Ahmed", email: "nida.ahmed@email.com" },
  ];

  const users: ModerateUser[] = [];
  for (let i = 1; i <= 65; i++) {
    const base = baseUsers[(i - 1) % baseUsers.length];
    const role = roles[(i - 1) % roles.length];
    const status = i % 12 === 0 ? "Banned" : i % 8 === 0 ? "Suspended" : "Active";
    
    const joinedDate = new Date();
    joinedDate.setDate(joinedDate.getDate() - (i % 30));
    joinedDate.setHours(10 + (i % 12), i % 60, 0, 0);

    let lastActive = "Today 10:24 AM";
    if (i % 3 === 0) {
      lastActive = "Today 8:15 AM";
    } else if (i % 3 === 1) {
      lastActive = "Yesterday 4:32 PM";
    } else {
      const activeDate = new Date();
      activeDate.setDate(activeDate.getDate() - (i % 5) - 1);
      lastActive = activeDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " 2:15 PM";
    }

    users.push({
      id: `u${i}`,
      fullName: i > baseUsers.length ? `${base.fullName} ${Math.ceil(i / baseUsers.length)}` : base.fullName,
      email: i > baseUsers.length 
        ? `${base.email.split('@')[0]}.${Math.ceil(i / baseUsers.length)}@${base.email.split('@')[1]}`
        : base.email,
      role,
      status,
      activity: {
        auctions: (i * 3) % 50,
        bids: (i * 7) % 150,
      },
      joinedDate: joinedDate.toISOString(),
      lastActive,
    });
  }
  return users;
};

export const MOCK_MODERATE_USERS_DATA: ModerateUsersResponse = {
  data: generateMockUsers(),
  totalCount: 65,
  page: 1,
  pageSize: 10,
  totalPages: 7,
};

export function updateMockUserStatus(userId: string, status: ModerateUserStatus): boolean {
  const user = MOCK_MODERATE_USERS_DATA.data.find((u) => u.id === userId);
  if (user) {
    user.status = status;
    return true;
  }
  return false;
}

export interface UseModerateUsersFilters {
  search: string;
  role: ModerateUserRole | "All Roles";
  status: ModerateUserStatus | "All Statuses";
  sortBy: string;
  page: number;
  pageSize: number;
}

export async function fetchModerateUsers(filters: UseModerateUsersFilters): Promise<ModerateUsersResponse> {
  const isAsc = filters.sortBy === "name" ? true : false;
  
  const response = await api.get<PagedListOfUserDto>("/users/users", {
    params: {
      SearchTerm: filters.search || undefined,
      SortBy: filters.sortBy === "name" ? "FullName" : "JoinedAt",
      IsAsc: isAsc,
      PageNumber: filters.page,
      PageSize: filters.pageSize,
    },
  });

  const result = mapPagedUsersToViewModel(response.data);

  let filtered = [...result.data];
  if (filters.role && filters.role !== "All Roles") {
    filtered = filtered.filter((u) => u.role === filters.role);
  }
  if (filters.status && filters.status !== "All Statuses") {
    filtered = filtered.filter((u) => u.status === filters.status);
  }

  return {
    ...result,
    data: filtered,
    totalCount: filtered.length,
    totalPages: Math.ceil(filtered.length / filters.pageSize) || 1,
  };
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

// Bulk Actions
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
