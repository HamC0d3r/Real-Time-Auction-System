"use client";

import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ModerateUser } from "../../types/admin.types";
import { useSuspendUser } from "../../api";

const suspendSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, { message: "Reason must be at least 5 characters long." })
    .max(500, { message: "Reason cannot exceed 500 characters." }),
  until: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date > new Date();
      },
      { message: "Suspension end date and time must be in the future." }
    ),
});

type SuspendFormValues = z.infer<typeof suspendSchema>;

interface SuspendUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: ModerateUser | null;
}

export const SuspendUserDialog = React.memo(function SuspendUserDialog({
  isOpen,
  onClose,
  user,
}: SuspendUserDialogProps) {
  const suspendMutation = useSuspendUser();
  const submitLockRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SuspendFormValues>({
    resolver: zodResolver(suspendSchema),
    defaultValues: {
      reason: "",
      until: "",
    },
  });

  const reasonValue = watch("reason") || "";

  useEffect(() => {
    if (isOpen) {
      reset({
        reason: "",
        until: "",
      });
    }
  }, [isOpen, reset, user]);

  if (!user) return null;

  const handleFormSubmit = async (values: SuspendFormValues) => {
    if (suspendMutation.isPending || submitLockRef.current) return;

    submitLockRef.current = true;

    try {
      const formattedUntil = values.until ? new Date(values.until).toISOString() : undefined;
      await suspendMutation.mutateAsync({
        userId: user.id,
        reason: values.reason,
        until: formattedUntil,
      });
      onClose();
    } catch (err) {
      console.error(`Failed to suspend user ${user.id}:`, err);
    } finally {
      submitLockRef.current = false;
    }
  };

  const initials = user.fullName
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : "U";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[440px] p-6 bg-card border border-border sm:rounded-2xl gap-0">
        <DialogHeader className="text-left mb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            Suspend User
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-semibold">
            Provide a reason and duration for suspending{" "}
            <span className="font-bold text-foreground">{user.fullName}</span>. This will be
            logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        {/* User Card Preview */}
        <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-xl mb-5">
          <div className="h-9 w-9 rounded-full bg-slate-200/60 dark:bg-slate-800/80 border border-border flex items-center justify-center overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">
                {initials}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-foreground truncate">
              {user.fullName}
            </span>
            <span className="text-xs text-muted-foreground truncate font-semibold">
              {user.email}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          {/* Reason Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason" className="text-sm font-bold text-foreground">
              Reason <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="reason"
              placeholder="Enter reason for this action..."
              {...register("reason")}
              disabled={suspendMutation.isPending}
              maxLength={500}
              className={cn(
                "min-h-[100px] max-h-[180px] w-full rounded-lg border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground text-foreground",
                "focus-visible:outline-hidden focus-visible:ring-1 transition-shadow",
                "border-warning-foreground/30 focus-visible:ring-warning-foreground focus-visible:border-warning-foreground",
                errors.reason && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <div className="flex items-center justify-between">
              {errors.reason ? (
                <span className="text-xs font-semibold text-destructive">
                  {errors.reason.message}
                </span>
              ) : (
                <span />
              )}
              <span className="text-[10px] font-bold text-muted-foreground/60 select-none">
                {reasonValue.length}/500
              </span>
            </div>
          </div>

          {/* Until Field (Date & Time Picker) */}
          <div className="flex flex-col gap-1.5 text-left">
            <Label htmlFor="until" className="text-sm font-bold text-foreground flex items-center gap-1">
              Until <span className="text-xs text-muted-foreground font-medium">(Optional - defaults to 30 days)</span>
            </Label>
            <Input
              id="until"
              type="datetime-local"
              {...register("until")}
              disabled={suspendMutation.isPending}
              className={cn(
                "h-11 w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground",
                "focus-visible:outline-hidden focus-visible:ring-1 transition-shadow",
                "border-warning-foreground/30 focus-visible:ring-warning-foreground focus-visible:border-warning-foreground",
                errors.until && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.until && (
              <span className="text-xs font-semibold text-destructive">
                {errors.until.message}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={suspendMutation.isPending}
              variant="outline"
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl bg-card border border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={suspendMutation.isPending}
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl text-primary-foreground flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground border-transparent"
            >
              {suspendMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirm Suspend
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
