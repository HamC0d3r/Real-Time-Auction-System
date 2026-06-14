"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Phone, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { useCreateAdminUser } from "../../api";

// Strict validation schema aligned with CreateAdminUserCommand backend rules
const createAdminSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required." })
    .max(50, { message: "First name cannot exceed 50 characters." }),
  secondName: z
    .string()
    .trim()
    .min(1, { message: "Second name is required." })
    .max(50, { message: "Second name cannot exceed 50 characters." }),
  thirdName: z
    .string()
    .trim()
    .min(1, { message: "Third name is required." })
    .max(50, { message: "Third name cannot exceed 50 characters." }),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required." })
    .max(50, { message: "Last name cannot exceed 50 characters." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email address format." }),
  phoneNumber: z
    .string()
    .trim()
    .min(7, { message: "Phone number is too short." })
    .max(15, { message: "Phone number is too long." })
    .regex(/^\+?[0-9]{7,15}$/, {
      message: "Phone number must contain only numbers (7-15 digits) and an optional '+' prefix.",
    }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
      {
        message: "Password must contain at least one letter and one number.",
      }
    ),
});

type CreateAdminFormValues = z.infer<typeof createAdminSchema>;

interface CreateAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAdminDialog = React.memo(function CreateAdminDialog({ isOpen, onClose }: CreateAdminDialogProps) {
  const createMutation = useCreateAdminUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      firstName: "",
      secondName: "",
      thirdName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        firstName: "",
        secondName: "",
        thirdName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: CreateAdminFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      onClose();
    } catch (err) {
      console.error("Failed to create admin:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[600px] p-6 bg-card border border-border sm:rounded-2xl gap-0">
        <DialogHeader className="text-left mb-6">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="h-5.5 w-5.5 text-primary" />
            Add New Administrator
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-semibold">
            Create a new administrative user with full dashboard moderation capabilities. Fill in all fields carefully.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Names Section (Four-part names) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              Full Legal Name (Four Parts)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className="text-xs font-bold text-foreground">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  disabled={createMutation.isPending}
                  className={cn(
                    "h-10 rounded-lg bg-input-background border-input focus:border-ring",
                    errors.firstName && "border-destructive focus-visible:ring-destructive/30"
                  )}
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <span className="text-[10px] font-bold text-destructive">
                    {errors.firstName.message}
                  </span>
                )}
              </div>

              {/* Second Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="secondName" className="text-xs font-bold text-foreground">
                  Second Name (Father) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="secondName"
                  placeholder="Second name"
                  disabled={createMutation.isPending}
                  className={cn(
                    "h-10 rounded-lg bg-input-background border-input focus:border-ring",
                    errors.secondName && "border-destructive focus-visible:ring-destructive/30"
                  )}
                  {...register("secondName")}
                />
                {errors.secondName && (
                  <span className="text-[10px] font-bold text-destructive">
                    {errors.secondName.message}
                  </span>
                )}
              </div>

              {/* Third Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="thirdName" className="text-xs font-bold text-foreground">
                  Third Name (Grandfather) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="thirdName"
                  placeholder="Third name"
                  disabled={createMutation.isPending}
                  className={cn(
                    "h-10 rounded-lg bg-input-background border-input focus:border-ring",
                    errors.thirdName && "border-destructive focus-visible:ring-destructive/30"
                  )}
                  {...register("thirdName")}
                />
                {errors.thirdName && (
                  <span className="text-[10px] font-bold text-destructive">
                    {errors.thirdName.message}
                  </span>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className="text-xs font-bold text-foreground">
                  Last Name (Family Name) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  disabled={createMutation.isPending}
                  className={cn(
                    "h-10 rounded-lg bg-input-background border-input focus:border-ring",
                    errors.lastName && "border-destructive focus-visible:ring-destructive/30"
                  )}
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <span className="text-[10px] font-bold text-destructive">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-1" />

          {/* Contact Details & Authentication */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              Account Credentials & Verification
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@mazadzone.com"
                    disabled={createMutation.isPending}
                    className={cn(
                      "h-10 pl-9 rounded-lg bg-input-background border-input focus:border-ring",
                      errors.email && "border-destructive focus-visible:ring-destructive/30"
                    )}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] font-bold text-destructive">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phoneNumber" className="text-xs font-bold text-foreground">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="phoneNumber"
                    placeholder="+962791234567"
                    disabled={createMutation.isPending}
                    className={cn(
                      "h-10 pl-9 rounded-lg bg-input-background border-input focus:border-ring",
                      errors.phoneNumber && "border-destructive focus-visible:ring-destructive/30"
                    )}
                    {...register("phoneNumber")}
                  />
                </div>
                {errors.phoneNumber && (
                  <span className="text-[10px] font-bold text-destructive">
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 mt-2">
              <Label htmlFor="password" className="text-xs font-bold text-foreground">
                Secure Password <span className="text-destructive">*</span>
              </Label>
              <PasswordInput
                id="password"
                placeholder="Enter strong password (min 6 chars, letters & numbers)"
                disabled={createMutation.isPending}
                className={cn(
                  "h-10 pl-9 rounded-lg bg-input-background border-input focus:border-ring",
                  errors.password && "border-destructive focus-visible:ring-destructive/30"
                )}
                {...register("password")}
              />
              {errors.password ? (
                <span className="text-[10px] font-bold text-destructive">
                  {errors.password.message}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Password must be at least 6 characters and contain both letters and digits.
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6 border-t border-border pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              variant="outline"
              className="flex-1 font-bold px-4 py-2 h-10 text-xs rounded-lg cursor-pointer bg-card border border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 font-bold px-4 py-2 h-10 text-xs rounded-lg cursor-pointer text-white flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground border-transparent"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Add Administrator
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
