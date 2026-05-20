import type { ProfileFormValues, AddressFormValues } from "../validations/profile.schemas";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationalId?: string;
  avatarUrl?: string;
  avatarInitial?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  building: string;
  landmark?: string;
  city: string;
  isDefault: boolean;
}

export interface UpdateProfileInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  name?: keyof ProfileFormValues;
  disabled?: boolean;
  value?: string;
  hint?: string;
}

export interface AddressFieldConfig {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  name: keyof Omit<AddressFormValues, "isDefault">;
  disabled?: boolean;
}


