import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(9, "Phone number must be at least 9 characters"),
  dateOfBirth: z.string().optional().or(z.literal("")),
});

export const addressSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phoneNumber: z.string().min(9, "Phone number must be at least 9 characters"),
  streetAddress: z.string().min(3, "Street address must be at least 3 characters"),
  building: z.string().min(1, "Building number/details are required"),
  landmark: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City name is required"),
  isDefault: z.boolean(),
});

export interface ProfileFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
}

export interface AddressFormValues {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  building: string;
  landmark?: string;
  city: string;
  isDefault: boolean;
}
