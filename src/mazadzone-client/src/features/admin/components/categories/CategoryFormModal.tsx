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
import type { Category } from "../../types/category.types";
import { useCreateCategory, useUpdateCategory } from "../../api";
import { CATEGORY_ICONS } from "../../constants/category.constants";



const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long." })
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
    .max(250, { message: "Description cannot exceed 250 characters." })
    .optional(),
  iconName: z.string(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export const CategoryFormModal = React.memo(function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      iconName: "FolderOpen",
      isActive: true,
    },
  });

  const nameValue = watch("name");
  const selectedIcon = watch("iconName") || "FolderOpen";
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Auto-generate slug from name in Create mode (or when slug is empty)
  useEffect(() => {
    if (!isEdit && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Replace multiple hyphens
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, isEdit, setValue]);

  // Reset form when modal opens or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          iconName: category.iconName || "FolderOpen",
          isActive: category.isActive,
        });
      } else {
        reset({
          name: "",
          slug: "",
          description: "",
          iconName: "FolderOpen",
          isActive: true,
        });
      }
    }
  }, [isOpen, reset, category]);

  const handleFormSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[500px] p-6 bg-card border border-border sm:rounded-2xl gap-0 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-left mb-6">
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEdit ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-semibold">
            {isEdit
              ? "Modify the details of this auction category below."
              : "Create a new top-level category to organize auction items."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-sm font-bold text-foreground">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Sports & Outdoors"
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
            <Label htmlFor="slug" className="text-sm font-bold text-foreground">
              Slug / URL Identifier <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              placeholder="e.g. sports-outdoors"
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
            <Label htmlFor="description" className="text-sm font-bold text-foreground">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Provide a brief summary of what belongs in this category..."
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

          {/* Icon Selector Field */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-bold text-foreground">
              Category Icon <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    disabled={isPending}
                    onClick={() => setValue("iconName", item.name, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary scale-[1.03]"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg border mb-1.5 shrink-0", item.color)}>
                      <IconComponent className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-[10px] font-bold select-none">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Field */}
          <div className="flex items-center justify-between p-3.5 bg-muted/30 border border-border rounded-xl mt-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground">Active Status</span>
              <span className="text-xs text-muted-foreground font-semibold">
                Disabled categories won&apos;t accept new auctions.
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
          <div className="flex items-center gap-3 mt-4 border-t border-border pt-4">
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
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
