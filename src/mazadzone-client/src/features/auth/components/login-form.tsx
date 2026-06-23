"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { PasswordInput } from "@/components/ui/password-input";
import { loginSchema, type LoginFormValues } from "../validations/login.schema";
import { ROUTES } from "@/config/routes.config";
import { useLoginMutation } from "../api";
import { useAuthStore } from "@/stores/auth.store";

/**
 * LoginForm
 * The main login form component for authenticating a user.
 */
export function LoginForm() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-[600px] mx-auto px-4 lg:px-8 py-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-11 ">Sign In</h1>
      </div>

      <div className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <InputWithIcon
            id="email"
            type="email"
            placeholder="Enter your email"
            icon={<Mail className="h-5 w-5" />}
            className="border-foreground"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            className="border-foreground"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
      </div>



      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-semibold mt-4 transition-colors"
      >
        {loginMutation.isPending ? "Signing in..." : "Sign in"}
      </Button>

      {/* Sign Up Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground font-medium">
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.AUTH.REGISTER} className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>

    </form>
  );
}
