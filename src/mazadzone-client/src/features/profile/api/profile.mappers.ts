/**
 * Pure mapping functions for the Profile feature.
 * Decouples raw backend DTO models from presentation ViewModels.
 */

import type { UserProfile, Address } from "../types/profile.types";
import type { BidderProfileDto, ProfileSettingsDto } from "./profile.contracts";

/**
 * Maps a backend BidderProfileDto to a presentation UserProfile ViewModel.
 */
export function mapBidderProfileToUserProfile(dto: BidderProfileDto): UserProfile {
  return {
    id: dto.id,
    fullName: dto.fullName,
    email: dto.email,
    phoneNumber: dto.phoneNumber,
    nationalId: undefined,
    avatarUrl: undefined,
    avatarInitial: dto.fullName ? dto.fullName.charAt(0).toUpperCase() : "U",
  };
}

/**
 * Maps a backend bidder profile's primary address to the standard Address ViewModel.
 */
export function mapBidderProfileToDefaultAddress(dto: BidderProfileDto): Address {
  return {
    id: "primary",
    title: "Primary Address",
    streetAddress: dto.street || "Street",
    building: dto.building || "1",
    landmark: dto.landmark || undefined,
    city: dto.city || "Amman",
    isDefault: true,
  };
}

/**
 * Maps a backend profile settings' primary address to the standard Address ViewModel.
 */
export function mapProfileSettingsToDefaultAddress(dto: ProfileSettingsDto): Address {
  return {
    id: "primary",
    title: "Primary Address",
    streetAddress: dto.street || "Street",
    building: dto.building || "1",
    landmark: dto.landmark || undefined,
    city: dto.city || "Amman",
    isDefault: true,
  };
}

