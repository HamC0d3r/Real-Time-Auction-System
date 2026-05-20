import { api } from "@/lib/api/client";
import type { UserProfile, Address } from "../types/profile.types";
import {
  getMockProfile,
  updateMockProfile,
  getMockAddresses,
  addMockAddress,
  updateMockAddress,
  deleteMockAddress,
} from "../testing/mock-profile";

const simulateDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches the user profile details.
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  await simulateDelay(200);

  /*
  // --- REAL API CALL (Uncomment when backend is ready) ---
  const response = await api.get<UserProfile>("/profile");
  return response.data;
  */

  return getMockProfile();
}

/**
 * Updates the user profile details.
 */
export async function updateUserProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  await simulateDelay(300);

  /*
  // --- REAL API CALL (Uncomment when backend is ready) ---
  const response = await api.put<UserProfile>("/profile", input);
  return response.data;
  */

  return updateMockProfile(input);
}

/**
 * Fetches the user's address book list.
 */
export async function fetchAddresses(): Promise<Address[]> {
  await simulateDelay(200);

  /*
  // --- REAL API CALL (Uncomment when backend is ready) ---
  const response = await api.get<Address[]>("/profile/addresses");
  return response.data;
  */

  return getMockAddresses();
}

/**
 * Adds a new address to the address book.
 */
export async function createAddress(address: Omit<Address, "id">): Promise<Address> {
  await simulateDelay(300);

  /*
  // --- REAL API CALL (Uncomment when backend is ready) ---
  const response = await api.post<Address>("/profile/addresses", address);
  return response.data;
  */

  return addMockAddress(address);
}

/**
 * Updates an existing address in the address book.
 */
export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
  await simulateDelay(300);

  /*
  // --- REAL API CALL (Uncomment when backend is ready) ---
  const response = await api.put<Address>(`/profile/addresses/${id}`, updates);
  return response.data;
  */

  return updateMockAddress(id, updates);
}

/**
 * Deletes an address from the address book.
 */
export async function removeAddress(id: string): Promise<void> {
  await simulateDelay(250);

  /*
  // --- REAL API CALL (Uncomment when backend is ready) ---
  await api.delete(`/profile/addresses/${id}`);
  return;
  */

  deleteMockAddress(id);
}
