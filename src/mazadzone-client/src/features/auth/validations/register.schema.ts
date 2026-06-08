import { z } from "zod";

/**
 * Zod schema for the "Create Account" registration form.
 * Handles client-side validation before API submission.
 * The mapper splits fullName and address into the individual fields required by the backend contract.
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(15, "Full Name must be at least 15 characters")
      .refine(
        (val) => val.trim().split(/\s+/).length >= 4,
        "Full Name must consist of at least 4 parts (First, Second, Third, and Last name)"
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((val) => /[A-Z]/.test(val), "Password must include at least one uppercase letter")
      .refine((val) => /[a-z]/.test(val), "Password must include at least one lowercase letter")
      .refine((val) => /[^a-zA-Z0-9]/.test(val), "Password must include at least one special character"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    phoneNumber: z.string().min(10, "Please enter a valid phone number"),
    city: z.string().min(2, "City is required"),
    street: z.string().min(2, "Street is required"),
    building: z.string().min(1, "Building/House number is required"),
    landmark: z.string().min(2, "Landmark is required"),
    nationalId: z.string().min(10, "Please enter a valid national ID"),
    nationalCardFile: z
      .any()
      .refine((file) => file instanceof File, "National card image is required")
      .refine(
        (file) =>
          file instanceof File &&
          (file.type === "image/jpeg" ||
            file.type === "image/png" ||
            file.type === "image/jpg"),
        "Only JPG, JPEG, and PNG images are permitted"
      )
      .refine(
        (file) => file instanceof File && file.size <= 5 * 1024 * 1024,
        "File size must not exceed 5MB"
      ),
    agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the Terms and Privacy Policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
