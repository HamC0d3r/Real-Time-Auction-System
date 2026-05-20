"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { disputeSchema, type DisputeFormValues } from "../validations/disputes.schemas";
import { useFileDispute } from "../api/disputes.queries";

interface DisputeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  itemName: string;
}

export function DisputeDialog({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  itemName,
}: DisputeDialogProps) {
  const { mutateAsync: fileDispute, isPending } = useFileDispute();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Watch description to update the character counter
  const descriptionValue = watch("description") || "";

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        description: "",
      });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (values: DisputeFormValues) => {
    try {
      await fileDispute({
        orderId,
        title: values.title,
        description: values.description,
      });
      onClose();
    } catch (err) {
      console.error("Failed to submit dispute:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[480px] p-6 bg-card border border-border sm:rounded-2xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex flex-col gap-1 text-left">
            <DialogTitle className="text-xl font-bold text-foreground">
              Open Dispute
            </DialogTitle>
            <p className="text-xs text-muted-foreground font-semibold">
              Order {orderNumber} - {itemName}
            </p>
          </div>
        </DialogHeader>

        {/* Notice Alert Box */}
        <div className="flex items-start gap-3 rounded-xl border border-warning-foreground/15 bg-warning p-4 text-xs text-warning-foreground">
          <AlertTriangle className="size-4.5 shrink-0 text-warning-foreground" />
          <p className="leading-relaxed font-semibold">
            Disputes are reviewed by our team within 48 hours. Please provide as much detail as possible.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5 mt-2">
          {/* Dispute Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title" className="text-sm font-bold text-foreground">
              Dispute Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter dispute title"
              {...register("title")}
              disabled={isPending}
              className="border-input bg-card focus-visible:ring-primary focus-visible:border-primary text-sm h-10 px-3 rounded-lg"
            />
            {errors.title && (
              <span className="text-xs font-semibold text-destructive">
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Dispute Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-sm font-bold text-foreground">
              Dispute Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              placeholder="Describe the issue with your order..."
              {...register("description")}
              disabled={isPending}
              maxLength={1000}
              className="min-h-[120px] max-h-[240px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground
              focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary 
              disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
            />
            <div className="flex items-center justify-between">
              {errors.description ? (
                <span className="text-xs font-semibold text-destructive">
                  {errors.description.message}
                </span>
              ) : (
                <span />
              )}
              <span className="text-[10px] font-bold text-muted-foreground/60 select-none">
                {descriptionValue.length}/1000
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              variant="outline"
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl bg-card border border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center gap-1.5"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Submit Dispute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
