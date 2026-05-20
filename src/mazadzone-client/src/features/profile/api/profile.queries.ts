import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateUserProfile,
  fetchAddresses,
  createAddress,
  updateAddress,
  removeAddress,
} from "./profile.api";
import type { UserProfile, Address } from "../types/profile.types";

export const profileKeys = {
  all: ["profile"] as const,
  info: () => [...profileKeys.all, "info"] as const,
  addresses: () => [...profileKeys.all, "addresses"] as const,
};

/**
 * Hook to fetch the user profile data.
 */
export function useGetProfile() {
  return useQuery<UserProfile>({
    queryKey: profileKeys.info(),
    queryFn: fetchUserProfile,
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
export function useGetAddresses() {
  return useQuery<Address[]>({
    queryKey: profileKeys.addresses(),
    queryFn: fetchAddresses,
  });
}

/**
 * Mutation to add a new address.
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation<Address, Error, Omit<Address, "id">>({
    mutationFn: createAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
    },
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
 * Mutation to delete an address.
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: removeAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
    },
  });
}
