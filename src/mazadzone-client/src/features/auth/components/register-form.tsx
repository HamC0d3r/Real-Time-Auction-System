"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { User, Mail, Phone, MapPin, IdCard, Building, Navigation, Map } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { PasswordInput } from "@/components/ui/password-input";
import { FileInputWithButton } from "@/components/ui/file-input-with-button";
import { AppAlert } from "@/components/feedback/app-alert";
import { registerSchema, type RegisterFormValues } from "../validations/register.schema";
import { ROUTES } from "@/config/routes.config";
import { useRegisterMutation } from "../api";
import { useNationalIdOcr } from "../hooks/useNationalIdOcr";

/**
 * RegisterForm
 * The main registration form component for creating an account.
 * When the user submits, the national card image is scanned via client-side OCR
 * and the registration API request is sent in a single combined flow.
 */
export function RegisterForm() {
  const registerMutation = useRegisterMutation();
  const { ocrPhase, scanFile } = useNationalIdOcr();
  const [ocrErrorMessage, setOcrErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      city: "",
      street: "",
      building: "",
      landmark: "",
      nationalId: "",
      nationalCardFile: null,
      agreeToTerms: false,
    },
  });

  const isScanning = ocrPhase === "scanning";
  const isSubmitting = registerMutation.isPending || isScanning;

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setOcrErrorMessage(null);
      await registerMutation.mutateAsync(data);
    } catch (error: any) {
      console.error("Registration submission error:", error);
      // Catch backend validation errors and map them contextually to form fields
      if (error && typeof error === "object" && "errors" in error && error.errors) {
        Object.entries(error.errors as Record<string, string[]>).forEach(([field, messages]) => {
          const message = messages[0];
          if (!message) return;

          if (field.includes("Identity.NameMismatch") || field.toLowerCase().includes("name")) {
            setError("fullName", { type: "server", message });
            if (field.includes("Identity.")) {
              setOcrErrorMessage(message);
            }
          } else if (
            field.includes("Identity.NationalIdMismatch") ||
            field.includes("Identity.InvalidNationalIdFormat") ||
            field.toLowerCase().includes("nationalid")
          ) {
            setError("nationalId", { type: "server", message });
            if (field.includes("Identity.")) {
              setOcrErrorMessage(message);
            }
          } else if (
            field.includes("Identity.ExtractionFailed") ||
            field.includes("Identity.ImageRequired") ||
            field.toLowerCase().includes("file") ||
            field.toLowerCase().includes("card")
          ) {
            setError("nationalCardFile", { type: "server", message });
            if (field.includes("Identity.")) {
              setOcrErrorMessage(message);
            }
          } else if (field.toLowerCase().includes("email")) {
            setError("email", { type: "server", message });
          } else if (field.toLowerCase().includes("phone")) {
            setError("phoneNumber", { type: "server", message });
          } else if (field.toLowerCase().includes("password")) {
            setError("password", { type: "server", message });
          }
        });
      }
    }
  };

  const submitLabel = registerMutation.isPending
    ? "Signing up..."
    : "Sign up";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-[600px] mx-auto px-4 lg:px-8 pt-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Create Your Account</h1>
        {ocrErrorMessage && (
          <AppAlert
            type="warning"
            title="Identity Matching Required"
            message={ocrErrorMessage}
            className="mb-6"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</Label>
          <InputWithIcon
            id="fullName"
            placeholder="Enter your full name"
            icon={<User className="h-5 w-5" />}
            className="border-foreground"
            {...register("fullName")}
          />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
          <InputWithIcon
            id="email"
            type="email"
            placeholder="Enter your email"
            icon={<Mail className="h-5 w-5" />}
            className="border-foreground"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
          <PasswordInput
            id="password"
            placeholder="Create a password"
            className="border-foreground"
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm your password"
            className="border-foreground"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">Phone Number</Label>
          <InputWithIcon
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone Number"
            icon={<Phone className="h-5 w-5" />}
            className="border-foreground"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* National ID */}
        <div className="space-y-2">
          <Label htmlFor="nationalId" className="text-sm font-medium text-foreground">National Id</Label>
          <InputWithIcon
            id="nationalId"
            placeholder="Enter your national id"
            icon={<IdCard className="h-5 w-5" />}
            className="border-foreground"
            {...register("nationalId")}
          />
          {errors.nationalId && <p className="text-xs text-red-500 mt-1">{errors.nationalId.message}</p>}
        </div>

        {/* Address Fields */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-foreground">City</Label>
            <InputWithIcon
              id="city"
              placeholder="Enter City"
              icon={<Map className="h-5 w-5" />}
              className="border-foreground"
              {...register("city")}
            />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
          </div>

          {/* Street */}
          <div className="space-y-2">
            <Label htmlFor="street" className="text-sm font-medium text-foreground">Street</Label>
            <InputWithIcon
              id="street"
              placeholder="Enter Street"
              icon={<MapPin className="h-5 w-5" />}
              className="border-foreground"
              {...register("street")}
            />
            {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
          </div>

          {/* Building */}
          <div className="space-y-2">
            <Label htmlFor="building" className="text-sm font-medium text-foreground">Building No.</Label>
            <InputWithIcon
              id="building"
              placeholder="Enter Building Number or Name"
              icon={<Building className="h-5 w-5" />}
              className="border-foreground"
              {...register("building")}
            />
            {errors.building && <p className="text-xs text-red-500 mt-1">{errors.building.message}</p>}
          </div>

          {/* Landmark */}
          <div className="space-y-2">
            <Label htmlFor="landmark" className="text-sm font-medium text-foreground">Landmark</Label>
            <InputWithIcon
              id="landmark"
              placeholder="e.g., Near City Mall"
              icon={<Navigation className="h-5 w-5" />}
              className="border-foreground"
              {...register("landmark")}
            />
            {errors.landmark && <p className="text-xs text-red-500 mt-1">{errors.landmark.message}</p>}
          </div>
        </div>

        {/* National Card Upload */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nationalCard" className="text-sm font-medium text-foreground">National Card</Label>
          <Controller
            name="nationalCardFile"
            control={control}
            render={({ field }) => (
              <FileInputWithButton
                id="nationalCard"
                placeholder="Upload your national id"
                className="border-foreground"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                isProcessing={isScanning}
                onFileSelect={async (file) => {
                  field.onChange(file);
                  setOcrErrorMessage(null);
                  if (file && file.type.startsWith("image/")) {
                    const detectedId = await scanFile(file);
                    if (detectedId) {
                      setValue("nationalId", detectedId, { shouldValidate: true });
                    }
                  }
                }}
              />
            )}
          />
          {errors.nationalCardFile && (
            <p className="text-xs text-red-500 mt-1">{errors.nationalCardFile.message?.toString()}</p>
          )}
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-center space-x-2 pt-2">
        <Controller
          name="agreeToTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="terms"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="rounded-sm bg-dark-foreground"
            />
          )}
        />
        <label
          htmlFor="terms"
          className="text-sm text-muted-foreground font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 "
        >
          I agree to the <Link href="#" className="text-primary hover:underline">Terms</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
        </label>
      </div>
      {errors.agreeToTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeToTerms.message}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-semibold transition-colors"
      >
        {submitLabel}
      </Button>

      {/* Login Link */}
      <div className="text-center ">
        <p className="text-sm text-muted-foreground font-medium">
          Already have an account? <Link href={ROUTES.AUTH.LOGIN} className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </form>
  );
}
