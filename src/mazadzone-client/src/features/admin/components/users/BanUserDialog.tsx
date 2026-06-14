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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ModerateUser } from "../../types/admin.types";
import { useBanUser } from "../../api";

const banSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, { message: "Reason must be at least 5 characters long." })
    .max(500, { message: "Reason cannot exceed 500 characters." }),
});

type BanFormValues = z.infer<typeof banSchema>;

interface BanUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: ModerateUser | null;
}

export const BanUserDialog = React.memo(function BanUserDialog({
  isOpen,
  onClose,
  user,
}: BanUserDialogProps) {
  const banMutation = useBanUser();
  const submitLockRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BanFormValues>({
    resolver: zodResolver(banSchema),
    defaultValues: {
      reason: "",
    },
  });

  const reasonValue = watch("reason") || "";

  useEffect(() => {
    if (isOpen) {
      reset({
        reason: "",
      });
    }
  }, [isOpen, reset, user]);

  if (!user) return null;

  const handleFormSubmit = async (values: BanFormValues) => {
    if (banMutation.isPending || submitLockRef.current) return;

    submitLockRef.current = true;

    try {
      await banMutation.mutateAsync({
        userId: user.id,
        reason: values.reason,
      });
      onClose();
    } catch (err) {
      console.error(`Failed to ban user ${user.id}:`, err);
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
            Ban User
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-semibold">
            Provide a reason for banning{" "}
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason" className="text-sm font-bold text-foreground">
              Reason <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="reason"
              placeholder="Enter reason for this action..."
              {...register("reason")}
              disabled={banMutation.isPending}
              maxLength={500}
              className={cn(
                "min-h-[100px] max-h-[180px] w-full rounded-lg border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground",
                "focus-visible:outline-hidden focus-visible:ring-1 transition-shadow",
                "border-destructive/30 focus-visible:ring-destructive focus-visible:border-destructive",
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={banMutation.isPending}
              variant="outline"
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl bg-card border border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={banMutation.isPending}
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl text-white flex items-center justify-center gap-1.5 bg-destructive hover:bg-destructive/95 text-destructive-foreground border-transparent"
            >
              {banMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirm Ban
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
