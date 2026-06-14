"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { ModerateAuction } from "../../types/admin.types";
import { useCancelAuction } from "../../api";

const CANCELLATION_REASONS = [
  "Fraudulent listing",
  "Prohibited item",
  "Seller request",
  "Policy violation",
  "Copyright infringement",
  "Other",
] as const;

type CancellationReason = (typeof CANCELLATION_REASONS)[number];

const cancelSchema = z.object({
  reason: z.enum(CANCELLATION_REASONS, "Please select a cancellation reason."),
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
}).refine(
  (data) => data.reason !== "Other" || (data.notes && data.notes.trim().length >= 5),
  { message: "Please provide at least 5 characters when selecting Other.", path: ["notes"] }
);

type CancelFormValues = z.infer<typeof cancelSchema>;

interface CancelAuctionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  auction: ModerateAuction | null;
}

export const CancelAuctionDialog = React.memo(function CancelAuctionDialog({
  isOpen,
  onClose,
  auction,
}: CancelAuctionDialogProps) {
  const cancelMutation = useCancelAuction();
  const [selectedReason, setSelectedReason] = useState<CancellationReason | "">("");
  const [notesValue, setNotesValue] = useState("");

  const {
    handleSubmit,
    setValue,
    register,
    reset,

    formState: { errors },
  } = useForm<CancelFormValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: { notes: "" },
  });

  const isOther = selectedReason === "Other";

  useEffect(() => {
    if (isOpen) {
      reset({ notes: "" });
      setSelectedReason("");
      setNotesValue("");
    }
  }, [isOpen, reset, auction]);

  if (!auction) return null;

  const handleReasonChange = (val: string) => {
    setSelectedReason(val as CancellationReason);
    setValue("reason", val as CancellationReason, { shouldValidate: true });
  };

  const handleFormSubmit = async (values: CancelFormValues) => {
    try {
      const fullReason = values.notes?.trim()
        ? `${values.reason} — ${values.notes.trim()}`
        : values.reason;
      await cancelMutation.mutateAsync({
        auctionId: auction.id,
        reason: fullReason,
      });
      onClose();
    } catch (err) {
      console.error(`Failed to cancel auction ${auction.id}:`, err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[460px] p-0 bg-card border border-border sm:rounded-2xl overflow-hidden gap-0">

        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-3 px-6 pt-6 pb-5 border-b border-border">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-destructive/10 shrink-0">
            <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
          </div>
          <DialogTitle className="text-[17px] font-bold text-foreground leading-tight">
            Force Cancel Auction
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="px-6 py-5 flex flex-col gap-5">

            {/* Auction Info Card */}
            <div className="rounded-xl border border-upcoming/60 bg-upcoming/25 px-4 py-3.5 flex flex-col gap-1">
              <p className="text-[13px] font-semibold text-upcoming-foreground leading-snug">
                <span className="font-bold">Auction ID:</span>{" "}
                {auction.id}
              </p>
              <p className="text-[13px] font-semibold text-upcoming-foreground leading-snug">
                <span className="font-bold">Title:</span>{" "}
                {auction.title}
              </p>
            </div>

            {/* Cancellation Reason */}
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-bold text-foreground">
                Cancellation Reason
              </p>
              <RadioGroup
                value={selectedReason}
                onValueChange={handleReasonChange}
                className="gap-0"
                aria-label="Cancellation reason"
              >
                {CANCELLATION_REASONS.map((reason) => (
                  <label
                    key={reason}
                    htmlFor={`reason-${reason}`}
                    className={cn(
                      "flex items-center gap-3 px-1 py-2.5 rounded-lg cursor-pointer transition-colors",
                      selectedReason === reason
                        ? "bg-primary/5"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <RadioGroupItem
                      id={`reason-${reason}`}
                      value={reason}
                      className="shrink-0"
                    />
                    <span
                      className={cn(
                        "text-[13px] font-medium leading-none select-none",
                        selectedReason === reason
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {reason}
                    </span>
                  </label>
                ))}
              </RadioGroup>
              {errors.reason && (
                <p className="text-xs font-semibold text-destructive -mt-1">
                  {errors.reason.message}
                </p>
              )}
            </div>

            {/* Additional Notes textarea */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cancel-notes"
                className="text-[13px] font-bold text-foreground"
              >
                Additional Notes
                {isOther ? (
                  <span className="text-destructive ml-1">*</span>
                ) : (
                  <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                )}
              </label>
              <textarea
                id="cancel-notes"
                placeholder={
                  isOther
                    ? "Describe the reason in detail..."
                    : "Add any extra context or notes for the audit log..."
                }
                {...register("notes", {
                  onChange: (e) => setNotesValue(e.target.value),
                })}
                disabled={cancelMutation.isPending}
                maxLength={500}
                rows={3}
                className={cn(
                  "w-full rounded-xl border bg-input-background px-3 py-2.5 text-sm text-foreground",
                  "placeholder:text-muted-foreground/60 resize-none transition-shadow",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  errors.notes
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "border-border focus-visible:border-ring"
                )}
              />
              <div className="flex items-center justify-between">
                {errors.notes ? (
                  <span className="text-xs font-semibold text-destructive">
                    {errors.notes.message}
                  </span>
                ) : (
                  <span />
                )}
                <span className="text-[10px] font-semibold text-muted-foreground/50 select-none">
                  {notesValue.length}/500
                </span>
              </div>
            </div>

            {/* Warning Box */}
            <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3.5">
              <p className="text-[13px] text-destructive/90 leading-relaxed">
                <span className="font-bold text-destructive">Warning:</span>{" "}
                This action cannot be undone. All active bids will be refunded
                and the seller will be notified.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={cancelMutation.isPending}
              className="px-5 h-10 text-sm font-semibold rounded-xl border-border bg-card text-foreground hover:bg-muted cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={cancelMutation.isPending || !selectedReason}
              className="px-5 h-10 text-sm font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 border-transparent cursor-pointer flex items-center gap-2"
            >
              {cancelMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
