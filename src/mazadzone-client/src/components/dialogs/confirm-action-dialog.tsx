"use client";

/**
 * confirm-action-dialog.tsx
 *
 * Reusable confirmation dialog for destructive or important actions.
 *
 * Wraps shadcn `AlertDialog` with standardised props, loading state, and
 * a `variant` prop that switches the confirm button between default and
 * destructive styling.
 */

import { memo } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  onConfirm: () => void;
  className?: string;
}

export const ConfirmActionDialog = memo(function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  className,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "bg-card border-border rounded-2xl shadow-xl",
          className
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="cursor-pointer font-semibold"
          >
            {cancelLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={cn(
              "cursor-pointer font-semibold min-w-[100px]",
              variant === "default" &&
              "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
                <span>Processing...</span>
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
