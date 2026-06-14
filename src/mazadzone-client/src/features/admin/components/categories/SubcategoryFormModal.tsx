"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Subcategory } from "../../types/category.types";
import { useCreateSubcategory, useUpdateSubcategory } from "../../api";
import { useAppToast } from "@/lib/toast/app-toast";

const subcategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  slug: z
    .string()
    .trim()
    .min(2, { message: "Slug must be at least 2 characters long." })
    .max(50, { message: "Slug cannot exceed 50 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Description is required." })
    .max(250, { message: "Description cannot exceed 250 characters." }),
  isActive: z.boolean(),
});

type SubcategoryFormValues = z.infer<typeof subcategorySchema>;

interface SubcategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategoryId: string;
  subcategory: Subcategory | null;
}

export const SubcategoryFormModal = React.memo(function SubcategoryFormModal({
  isOpen,
  onClose,
  parentCategoryId,
  subcategory,
}: SubcategoryFormModalProps) {
  const createMutation = useCreateSubcategory();
  const updateMutation = useUpdateSubcategory();
  const appToast = useAppToast();
  const isEdit = !!subcategory;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });

  const nameValue = watch("name");
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Auto-generate slug from name in Create mode
  useEffect(() => {
    if (!isEdit && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, isEdit, setValue]);

  // Reset form when modal opens or subcategory changes
  useEffect(() => {
    if (isOpen) {
      if (subcategory) {
        reset({
          name: subcategory.name,
          slug: subcategory.slug,
          description: subcategory.description || "",
          isActive: subcategory.isActive,
        });
      } else {
        reset({
          name: "",
          slug: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [isOpen, reset, subcategory]);

  const handleFormSubmit = async (values: SubcategoryFormValues) => {
    try {
      if (isEdit && subcategory) {
        await updateMutation.mutateAsync({
          id: subcategory.id,
          data: values,
        });
        appToast.success("Subcategory Updated", "Subcategory has been updated successfully.");
      } else {
        await createMutation.mutateAsync({
          ...values,
          parentCategoryId,
        });
        appToast.success("Subcategory Created", "New subcategory has been created successfully.");
      }
      onClose();
    } catch (err: unknown) {
      console.error("Failed to save subcategory:", err);
      appToast.fromApiError(err, "Failed to save subcategory. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[440px] p-6 bg-card border border-border sm:rounded-2xl gap-0">
        <DialogHeader className="text-left mb-5">
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEdit ? "Edit Subcategory" : "Add Subcategory"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-semibold">
            {isEdit
              ? "Modify the details of this subcategory below."
              : "Create a new subcategory underneath the selected parent category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sub-name" className="text-sm font-bold text-foreground">
              Subcategory Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sub-name"
              placeholder="e.g. Laptops & Notebooks"
              {...register("name")}
              disabled={isPending}
              className={cn(errors.name && "border-destructive focus-visible:ring-destructive/20")}
            />
            {errors.name && (
              <span className="text-xs font-semibold text-destructive mt-0.5">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Slug Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sub-slug" className="text-sm font-bold text-foreground">
              Slug / URL Identifier <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sub-slug"
              placeholder="e.g. laptops-notebooks"
              {...register("slug")}
              disabled={isPending}
              className={cn(errors.slug && "border-destructive focus-visible:ring-destructive/20")}
            />
            {errors.slug && (
              <span className="text-xs font-semibold text-destructive mt-0.5">
                {errors.slug.message}
              </span>
            )}
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sub-description" className="text-sm font-bold text-foreground">
              Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="sub-description"
              placeholder="Provide a brief summary of what belongs here..."
              {...register("description")}
              disabled={isPending}
              maxLength={250}
              className={cn(
                "min-h-[80px] max-h-[140px] w-full rounded-lg border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground",
                "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring border-border transition-shadow",
                errors.description && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.description && (
              <span className="text-xs font-semibold text-destructive mt-0.5">
                {errors.description.message}
              </span>
            )}
          </div>

          {/* Status Field */}
          <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl mt-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground">Active Status</span>
              <span className="text-xs text-muted-foreground font-semibold">
                Disabled subcategories are hidden from users.
              </span>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />
          </div>

          {/* Action Buttons */}
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
              className="flex-1 font-bold px-4 py-2.5 h-11 text-xs cursor-pointer rounded-xl text-white flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground border-transparent"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Subcategory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
