import type { FormFieldConfig, UserProfile, AddressFieldConfig } from "../types/profile.types";

/**
 * Returns the field configurations for the Account Information form.
 * Handles dynamic properties like `disabled` state, placeholders from the API, and read-only values.
 */
export const getAccountInfoFields = (
  isPending: boolean,
  profile: UserProfile
): FormFieldConfig[] => [
  {
    id: "profileFullName",
    label: "Full Name",
    placeholder: profile.fullName || "Enter full name",
    name: "fullName",
    disabled: isPending,
  },
  {
    id: "profileEmail",
    label: "Email Address",
    placeholder: profile.email || "Enter email address",
    name: "email",
    disabled: isPending,
  },
  {
    id: "profilePhone",
    label: "Phone Number",
    placeholder: profile.phoneNumber || "Enter phone number",
    name: "phoneNumber",
    disabled: isPending,
  },
  {
    id: "profileDob",
    label: "Date of Birth",
    placeholder: profile.dateOfBirth || "YYYY-MM-DD",
    type: "date",
    name: "dateOfBirth",
    disabled: isPending,
  },
  {
    id: "profileNationalId",
    label: "National ID",
    value: profile.nationalId ?? "1234567890",
    disabled: true,
    hint: "National ID cannot be changed",
  },
];

/**
 * Returns the field configurations for the Address creation/editing form.
 */
export const getAddressFields = (isPending: boolean): AddressFieldConfig[] => [
  {
    id: "fullName",
    label: "Full Name",
    placeholder: "Enter full name",
    name: "fullName",
    disabled: isPending,
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    placeholder: "+966 50 123 4567",
    name: "phoneNumber",
    disabled: isPending,
  },
  {
    id: "streetAddress",
    label: "Street Address",
    placeholder: "Street name",
    name: "streetAddress",
    disabled: isPending,
  },
  {
    id: "building",
    label: "Building",
    placeholder: "Building no.",
    name: "building",
    disabled: isPending,
  },
  {
    id: "landmark",
    label: "Landmark",
    placeholder: "Near mall, next to mosque...",
    name: "landmark",
    disabled: isPending,
  },
  {
    id: "city",
    label: "City",
    placeholder: "City",
    name: "city",
    disabled: isPending,
  },
];


