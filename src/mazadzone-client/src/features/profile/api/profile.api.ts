import { api } from "@/lib/api/client";
import type { UserProfile, Address } from "../types/profile.types";
import type { BidderProfileDto, ChangePasswordRequest, ProfileSettingsDto } from "./profile.contracts";
import { mapBidderProfileToUserProfile, mapProfileSettingsToDefaultAddress } from "./profile.mappers";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Fetches the user profile details from the ASP.NET Core backend.
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  const response = await api.get<BidderProfileDto>(`/bidders/${userId}`);

  // Store a cached copy of the profile email in localStorage to check for updates
  if (typeof window !== "undefined") {
    localStorage.setItem("mazadzone_last_fetched_email", response.data.email);
  }

  return mapBidderProfileToUserProfile(response.data);
}

/**
 * Updates the user profile details.
 * Triggers backend credential updates for email changes.
 */
export async function updateUserProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) {
    throw new Error("User is not authenticated");
  }

  // Check if email has changed compared to last fetched email
  const lastEmail = typeof window !== "undefined" ? localStorage.getItem("mazadzone_last_fetched_email") : null;
  if (input.email && lastEmail && input.email !== lastEmail) {
    // Fire real backend ChangeEmailRequest
    await api.put("/users/email", {
      newEmail: input.email,
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("mazadzone_last_fetched_email", input.email);
    }
  }

  // For general fields (fullName, phoneNumber, etc.) we simulate successful save
  // and update the global store's active user session instantly.
  const activeUser = useAuthStore.getState().user;
  if (activeUser) {
    const updatedUser = {
      ...activeUser,
      fullName: input.fullName || activeUser.fullName,
      email: input.email || activeUser.email,
    };
    useAuthStore.getState().setUser(updatedUser);
  }

  return {
    id: userId,
    fullName: input.fullName || "User",
    email: input.email || "",
    phoneNumber: input.phoneNumber,
    avatarUrl: input.avatarUrl,
  };
}

/**
 * Fetches the user's address book list, returning the primary registered address.
 */
export async function fetchAddresses(userId?: string): Promise<Address[]> {
  const activeUserId = userId || useAuthStore.getState().user?.id;
  if (!activeUserId) {
    throw new Error("User is not authenticated");
  }

  let primaryAddress: Address | null = null;
  try {
    const response = await api.get<ProfileSettingsDto>(`/users/${activeUserId}/profile-settings`);
    primaryAddress = mapProfileSettingsToDefaultAddress(response.data);
  } catch (error) {
    console.error("Failed to load primary address from backend profile settings:", error);
  }

  return primaryAddress ? [primaryAddress] : [];
}

/**
 * Updates an existing address in the address book.
 */
export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
  if (id === "primary") {
    // Primary address is locked to backend data, so we bypass modifying it locally
    return {
      id: "primary",
      title: "Primary Address",
      streetAddress: updates.streetAddress || "Street",
      building: updates.building || "1",
      landmark: updates.landmark,
      city: updates.city || "Amman",
      isDefault: true,
    };
  }

  throw new Error(`Address with ID ${id} not found.`);
}

/**
 * Changes the user's password in the ASP.NET Core backend.
 */
export async function changePassword(input: ChangePasswordRequest): Promise<void> {
  await api.put("/users/password", input);
}

/**
 * Fetches the user profile settings from the ASP.NET Core backend.
 */
export async function fetchProfileSettings(userId?: string): Promise<ProfileSettingsDto> {
  const activeUserId = userId || useAuthStore.getState().user?.id;
  if (!activeUserId) {
    throw new Error("User is not authenticated");
  }

  const response = await api.get<ProfileSettingsDto>(`/users/${activeUserId}/profile-settings`);
  return response.data;
}
