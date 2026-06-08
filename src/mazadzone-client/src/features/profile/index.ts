export { ProfileSettingsPage } from "./components/ProfileSettingsPage";
export { ChangePasswordForm } from "./components/ChangePasswordForm";
export {
  useGetProfile,
  useUpdateProfile,
  useGetAddresses,
  useChangePassword,
  useGetProfileSettings,
} from "./api";
export type { ProfileSettingsDto } from "./api";
export type { UserProfile, Address, UpdateProfileInput } from "./types/profile.types";
export { AddressDialog } from "./components/AddressDialog";
export { AddressSelectStep } from "./components/AddressSelectStep";
export type { AddressSelectStepProps } from "./components/AddressSelectStep";

// Public User Profiles
export { UserProfilePage } from "./components/Profile/UserProfilePage";
export { useGetPublicUserProfile, getPublicUserProfile } from "./api/get-public-user-profile";
export type { PublicUserProfile, UserRole } from "./types/user-profile.types";
export type { BidderProfileDto } from "./api";

