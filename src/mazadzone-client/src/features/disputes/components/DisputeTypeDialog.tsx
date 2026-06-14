"use client";

import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DisputeTypeFormValues {
  name: string;
  description: string;
}

interface DisputeTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: { id?: string; name: string; description: string }) => void;
  initialValues?: { id?: string; name: string; description: string } | null;
}

export const DisputeTypeDialog = memo(function DisputeTypeDialog({
  isOpen,
  onClose,
  onSave,
  initialValues,
}: DisputeTypeDialogProps) {
  const isEdit = !!initialValues?.id;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DisputeTypeFormValues>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const descriptionValue = watch("description") || "";

  // Synchronize initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialValues?.name || "",
        description: initialValues?.description || "",
      });
    }
  }, [isOpen, initialValues, reset]);

  const handleFormSubmit = (values: DisputeTypeFormValues) => {
    onSave({
      id: initialValues?.id,
      name: values.name,
      description: values.description,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[480px] p-6 bg-card border border-border sm:rounded-2xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex flex-col gap-1 text-left">
            <DialogTitle className="text-xl font-bold text-foreground">
              {isEdit ? "Update Dispute Type" : "Add Dispute Type"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground font-semibold">
              {isEdit ? "Modify dispute classification parameters." : "Define a new category structure for system cases."}
            </p>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5 mt-2">
          {/* Dispute Type Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-sm font-bold text-foreground">
              Dispute Type Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Damaged Item"
              {...register("name", { required: "Name is required" })}
              className="border-input bg-card focus-visible:ring-primary focus-visible:border-primary text-sm h-10 px-3 rounded-lg text-foreground"
            />
            {errors.name && (
              <span className="text-xs font-semibold text-destructive">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Dispute Type Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-sm font-bold text-foreground">
              Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              placeholder="Describe what kind of cases fall under this classification..."
              {...register("description", { required: "Description is required" })}
              maxLength={500}
              className="min-h-[100px] max-h-[200px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground text-foreground
              focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-shadow"
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
                {descriptionValue.length}/500
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl bg-card border border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center gap-1.5"
            >
              {isEdit ? "Update Type" : "Create Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
