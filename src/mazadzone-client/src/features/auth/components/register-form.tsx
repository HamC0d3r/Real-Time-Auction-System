"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

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
import { MAIN_FIELDS, ADDRESS_FIELDS } from "./register-form.constants";

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

      // Run OCR on submit as a fallback to ensure national ID is extracted from the card image
      let nationalId = data.nationalId;
      const cardFile = data.nationalCardFile;
      if (cardFile instanceof File && cardFile.type.startsWith("image/")) {
        const detectedId = await scanFile(cardFile);
        if (detectedId) {
          nationalId = detectedId;
          setValue("nationalId", detectedId, { shouldValidate: true });
        }
      }

      await registerMutation.mutateAsync({ ...data, nationalId });
    } catch (error: unknown) {
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

  const submitLabel = isScanning
    ? "Scanning ID..."
    : registerMutation.isPending
      ? "Signing up..."
      : "Sign up";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-[700px] mx-auto px-4 lg:px-8 pt-20">
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
        {/* Main form fields */}
        {MAIN_FIELDS.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-foreground">
              {field.label}
            </Label>
            {field.type === "password" ? (
              <PasswordInput
                id={field.id}
                placeholder={field.placeholder}
                className="border-foreground"
                {...register(field.id)}
              />
            ) : (
              <InputWithIcon
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                icon={field.icon}
                className="border-foreground"
                maxLength={field.maxLength}
                {...register(field.id, field.isNumeric ? {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  },
                } : undefined)}
              />
            )}
            {errors[field.id]?.message && (
              <p className="text-xs text-red-500 mt-1">{errors[field.id]?.message?.toString()}</p>
            )}
          </div>
        ))}

        {/* Address Fields */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
          {ADDRESS_FIELDS.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-medium text-foreground">
                {field.label}
              </Label>
              <InputWithIcon
                id={field.id}
                placeholder={field.placeholder}
                icon={field.icon}
                className="border-foreground"
                {...register(field.id)}
              />
              {errors[field.id]?.message && (
                <p className="text-xs text-red-500 mt-1">{errors[field.id]?.message?.toString()}</p>
              )}
            </div>
          ))}
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
