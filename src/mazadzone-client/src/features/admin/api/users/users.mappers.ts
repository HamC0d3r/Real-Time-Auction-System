import { format } from "date-fns";
import type { ModerateUser, ModerateUserRole, ModerateUserStatus, ModerateUsersResponse } from "../../types/admin.types";
import type { UserDto, PagedListOfUserDto } from "./users.contracts";

export function mapUserDtoToViewModel(user: UserDto): ModerateUser {
  let lastActive = "Never logged in";
  if (user.lastLogin) {
    try {
      lastActive = format(new Date(user.lastLogin), "MMM d, yyyy h:mm a");
    } catch {
      lastActive = user.lastLogin;
    }
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: (user.role || "Bidder") as ModerateUserRole,
    status: (user.status || "Active") as ModerateUserStatus,
    activity: {
      auctions: 0,
      bids: 0,
    },
    joinedDate: user.joinedAt,
    lastActive,
  };
}

export function mapPagedUsersToViewModel(paged: PagedListOfUserDto): ModerateUsersResponse {
  return {
    data: paged.items.map(mapUserDtoToViewModel),
    totalCount: paged.totalCount,
    page: paged.pageNumber,
    pageSize: paged.pageSize,
    totalPages: paged.totalPages,
  };
}
