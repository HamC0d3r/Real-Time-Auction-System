"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { changePasswordSchema, type ChangePasswordFormValues } from "../validations/profile.schemas";
import { useChangePassword } from "../api/profile.queries";

export function ChangePasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });

      setSuccessMessage("Your password has been changed successfully.");
      reset();
      
      // Hide success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password. Please check your credentials and try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center gap-2.5 mb-6">
        <KeyRound className="size-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Change Password</h2>
      </div>

      {/* Success/Error Alerts */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-success bg-success/5 p-4 text-sm text-foreground">
          <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
          <span className="font-medium text-emerald-800 dark:text-emerald-400">
            {successMessage}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-destructive bg-destructive/5 p-4 text-sm text-foreground">
          <AlertTriangle className="size-5 text-destructive shrink-0" />
          <span className="font-medium text-destructive-foreground">
            {errorMessage}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-md">
        {/* Current Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentPassword" className="text-sm font-semibold text-foreground">
            Current Password
          </Label>
          <PasswordInput
            id="currentPassword"
            placeholder="Enter current password"
            {...register("currentPassword")}
            disabled={changePasswordMutation.isPending}
            className="border-input bg-card focus-visible:ring-primary focus-visible:border-primary"
          />
          {errors.currentPassword && (
            <span className="text-xs font-medium text-destructive">
              {errors.currentPassword.message}
            </span>
          )}
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
            New Password
          </Label>
          <PasswordInput
            id="newPassword"
            placeholder="Enter new password"
            {...register("newPassword")}
            disabled={changePasswordMutation.isPending}
            className="border-input bg-card focus-visible:ring-primary focus-visible:border-primary"
          />
          {errors.newPassword && (
            <span className="text-xs font-medium text-destructive">
              {errors.newPassword.message}
            </span>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmNewPassword" className="text-sm font-semibold text-foreground">
            Confirm New Password
          </Label>
          <PasswordInput
            id="confirmNewPassword"
            placeholder="Confirm new password"
            {...register("confirmNewPassword")}
            disabled={changePasswordMutation.isPending}
            className="border-input bg-card focus-visible:ring-primary focus-visible:border-primary"
          />
          {errors.confirmNewPassword && (
            <span className="text-xs font-medium text-destructive">
              {errors.confirmNewPassword.message}
            </span>
          )}
        </div>

        {/* Submission Buttons */}
        <div className="flex items-center gap-3 mt-2">
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="font-semibold px-6 py-2.5 h-auto text-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            {changePasswordMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}
