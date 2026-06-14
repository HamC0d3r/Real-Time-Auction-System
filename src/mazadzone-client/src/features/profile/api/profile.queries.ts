import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateUserProfile,
  fetchAddresses,
  updateAddress,
  changePassword,
  fetchProfileSettings,
} from "./profile.api";
import type { UserProfile, Address } from "../types/profile.types";
import type { ChangePasswordRequest, ProfileSettingsDto } from "./profile.contracts";

export const profileKeys = {
  all: ["profile"] as const,
  info: () => [...profileKeys.all, "info"] as const,
  addresses: () => [...profileKeys.all, "addresses"] as const,
  settings: (userId: string) => [...profileKeys.all, "settings", userId] as const,
};

/**
 * Hook to fetch the user profile data.
 */
export function useGetProfile(options?: { enabled?: boolean }) {
  return useQuery<UserProfile>({
    queryKey: profileKeys.info(),
    queryFn: fetchUserProfile,
    ...options,
  });
}

/**
 * Hook to fetch profile settings for become seller page or profile display.
 */
export function useGetProfileSettings(userId: string) {
  return useQuery<ProfileSettingsDto>({
    queryKey: profileKeys.settings(userId),
    queryFn: () => fetchProfileSettings(userId),
    enabled: !!userId,
  });
}

/**
 * Mutation to update user profile information.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, Partial<UserProfile>>({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.info() });
    },
  });
}

/**
 * Hook to retrieve all addresses.
 */
export function useGetAddresses(options?: { enabled?: boolean }) {
  return useQuery<Address[]>({
    queryKey: profileKeys.addresses(),
    queryFn: () => fetchAddresses(),
    ...options,
  });
}

/**
 * Mutation to modify an existing address.
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation<Address, Error, { id: string; updates: Partial<Address> }>({
    mutationFn: ({ id, updates }) => updateAddress(id, updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
    },
  });
}

/**
 * Mutation to change user password.
 */
export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: changePassword,
  });
}
