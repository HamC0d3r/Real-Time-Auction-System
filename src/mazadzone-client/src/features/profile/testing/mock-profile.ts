import type { UserProfile, Address } from "../types/profile.types";

export const INITIAL_PROFILE: UserProfile = {
  id: "user-ahmed",
  fullName: "Ahmed Al-Mansouri",
  email: "ahmed.mansouri@email.com",
  phoneNumber: "+966 50 123 4567",
  dateOfBirth: "",
  nationalId: "1234567890",
  avatarUrl: "",
  avatarInitial: "A",
};

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    fullName: "Ahmed Al-Mansouri",
    phoneNumber: "+966 50 123 4567",
    streetAddress: "King Fahd Road, Al Olaya District",
    building: "Building 123, Apt 45",
    landmark: "",
    city: "Riyadh 12214",
    isDefault: true,
  },
  {
    id: "addr-2",
    fullName: "Ahmed Al-Mansouri (Office)",
    phoneNumber: "+966 50 123 4567",
    streetAddress: "Prince Mohammed bin Abdulaziz Road, Al Malqa District",
    building: "Office Tower 2, Floor 15",
    landmark: "",
    city: "Riyadh 13521",
    isDefault: false,
  },
];

// In-memory states
let mockProfile = { ...INITIAL_PROFILE };
let mockAddresses = [...INITIAL_ADDRESSES];

export function getMockProfile(): UserProfile {
  return mockProfile;
}

export function updateMockProfile(input: Partial<UserProfile>): UserProfile {
  mockProfile = {
    ...mockProfile,
    ...input,
    avatarInitial: input.fullName
      ? input.fullName.substring(0, 1).toUpperCase()
      : mockProfile.avatarInitial,
  };
  return mockProfile;
}

export function getMockAddresses(): Address[] {
  return mockAddresses;
}

export function addMockAddress(address: Omit<Address, "id">): Address {
  const newAddress: Address = {
    ...address,
    id: `addr-${Date.now()}`,
  };

  if (newAddress.isDefault) {
    mockAddresses = mockAddresses.map((a) => ({ ...a, isDefault: false }));
  }

  // If there are no addresses, make it default automatically
  if (mockAddresses.length === 0) {
    newAddress.isDefault = true;
  }

  mockAddresses.push(newAddress);
  return newAddress;
}

export function updateMockAddress(id: string, updates: Partial<Address>): Address {
  if (updates.isDefault) {
    mockAddresses = mockAddresses.map((a) => ({ ...a, isDefault: false }));
  }

  mockAddresses = mockAddresses.map((a) =>
    a.id === id ? { ...a, ...updates } : a
  );

  const updated = mockAddresses.find((a) => a.id === id);
  if (!updated) {
    throw new Error("Address not found");
  }
  return updated;
}

export function deleteMockAddress(id: string): void {
  const target = mockAddresses.find((a) => a.id === id);
  const wasDefault = target?.isDefault;

  mockAddresses = mockAddresses.filter((a) => a.id !== id);

  // If we deleted the default address and have remaining, promote the first one
  if (wasDefault && mockAddresses.length > 0) {
    mockAddresses[0].isDefault = true;
  }
}
