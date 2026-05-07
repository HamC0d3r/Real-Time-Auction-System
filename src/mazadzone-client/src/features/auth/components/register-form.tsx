"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { User, Mail, Phone, MapPin, IdCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { PasswordInput } from "@/components/ui/password-input";
import { FileInputWithButton } from "@/components/ui/file-input-with-button";
import { registerSchema, type RegisterFormValues } from "../validations/register.schema";
import { ROUTES } from "@/config/routes.config";

/**
 * RegisterForm
 * The main registration form component for creating an account.
 */
export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      address: "",
      nationalId: "",
      nationalCardFile: null,
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      console.log("Form data ready for submission:", data);
      // TODO: Hook up API mutation here
      // await registerMutation.mutateAsync(data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-[600px] mx-auto px-4 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Create Your Account</h1>
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

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium text-foreground">Address</Label>
          <InputWithIcon
            id="address"
            placeholder="Enter your Address"
            icon={<MapPin className="h-5 w-5" />}
            className="border-foreground"
            {...register("address")}
          />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
        </div>

        {/* National ID */}
        <div className="space-y-2 md:col-span-2">
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
                onFileSelect={(file) => field.onChange(file)}
              />
            )}
          />
          {errors.nationalCardFile && <p className="text-xs text-red-500 mt-1">{errors.nationalCardFile.message?.toString()}</p>}
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
          className="text-sm text-muted-foreground font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the <Link href="#" className="text-primary hover:underline">Terms</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
        </label>
      </div>
      {errors.agreeToTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeToTerms.message}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-semibold mt-4 transition-colors"
      >
        {isLoading ? "Signing up..." : "Sign up"}
      </Button>

      {/* Login Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground font-medium">
          Already have an account? <Link href={ROUTES.AUTH.LOGIN} className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </form>
  );
}
