"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { addressSchema, type AddressFormValues } from "../validations/profile.schemas";
import type { Address } from "../types/profile.types";
import { getAddressFields } from "../constants/profile.constants";

interface AddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: Address | null;
  onSubmit: (data: Omit<Address, "id">) => void;
  isPending: boolean;
}

export function AddressDialog({
  isOpen,
  onClose,
  addressToEdit,
  onSubmit,
  isPending,
}: AddressDialogProps) {
  const isEditing = !!addressToEdit;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      streetAddress: "",
      building: "",
      landmark: "",
      city: "",
      isDefault: false,
    },
  });

  // Sync edit address values when modal opens or target changes
  useEffect(() => {
    if (isOpen) {
      if (addressToEdit) {
        reset({
          fullName: addressToEdit.fullName,
          phoneNumber: addressToEdit.phoneNumber,
          streetAddress: addressToEdit.streetAddress,
          building: addressToEdit.building,
          landmark: addressToEdit.landmark ?? "",
          city: addressToEdit.city,
          isDefault: addressToEdit.isDefault,
        });
      } else {
        reset({
          fullName: "",
          phoneNumber: "",
          streetAddress: "",
          building: "",
          landmark: "",
          city: "",
          isDefault: false,
        });
      }
    }
  }, [isOpen, addressToEdit, reset]);

  const handleFormSubmit = (values: AddressFormValues) => {
    onSubmit(values as Omit<Address, "id">);
  };

  const fields = getAddressFields(isPending);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border p-6 shadow-lg rounded-xl gap-0">
        <DialogHeader className="border-b border-border pb-4 mb-5">
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEditing ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label htmlFor={field.id} className="text-sm font-semibold text-foreground">
                {field.label}
              </Label>
              <Input
                id={field.id}
                placeholder={field.placeholder}
                {...register(field.name)}
                disabled={field.disabled}
                className="border-input bg-card focus-visible:ring-primary focus-visible:border-primary"
              />
              {errors[field.name] && (
                <span className="text-xs font-medium text-destructive">
                  {errors[field.name]?.message}
                </span>
              )}
            </div>
          ))}

          {/* Default Checkbox */}
          <div className="flex items-center gap-2 mt-1">
            <Controller
              control={control}
              name="isDefault"
              render={({ field }) => (
                <Checkbox
                  id="isDefault"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
              )}
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-medium text-foreground cursor-pointer select-none"
            >
              Set as default address
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 font-semibold px-4 py-2.5 h-auto text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Edit Address" : "Add Address"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              variant="outline"
              className="flex-1 font-semibold px-4 py-2.5 h-auto text-sm cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
