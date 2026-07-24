import { api } from "@/lib/api/client";
import type { CreateAdminUserCommand } from "./access.contracts";
import type { PagedListOfUserDto, UserDto } from "../users/users.contracts";

/**
 * Sends a POST request to register a new administrator account.
 * Endpoint: POST /api/v1/users/admin
 */
export async function createAdminUserApi(data: CreateAdminUserCommand): Promise<string> {
  const response = await api.post<string>("/users/admin", data);
  return response.data;
}

/**
 * Fetches all admin users by requesting a large batch from the main users endpoint
 * and filtering client-side for roles containing 'admin'.
 * Endpoint: GET /api/v1/users/users
 */
export async function fetchAdminUsersApi(): Promise<UserDto[]> {
  const response = await api.get<PagedListOfUserDto>("/users", {
    params: {
      PageNumber: 1,
      PageSize: 99, // Fetch a large batch to ensure we capture all administrators
    },
  });

  return response.data.items.filter(
    (user) => user.role.toLowerCase() === "admin"
  );
}
