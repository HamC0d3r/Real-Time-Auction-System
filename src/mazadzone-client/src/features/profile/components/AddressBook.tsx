"use client";

import { useState } from "react";
import { Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { AddressDialog } from "./AddressDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useGetAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "../api/profile.queries";
import type { Address } from "../types/profile.types";

export function AddressBook() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  // States for Delete Confirmation Modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

  const { data: addresses = [], isLoading, isError, refetch } = useGetAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();

  const handleAddClick = () => {
    setAddressToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (address: Address) => {
    setAddressToEdit(address);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAddressToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDeleteId) return;
    try {
      await deleteMutation.mutateAsync(addressToDeleteId);
    } catch (err) {
      console.error("Failed to delete address:", err);
    } finally {
      setIsDeleteConfirmOpen(false);
      setAddressToDeleteId(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setAddressToEdit(null);
  };

  const handleDialogSubmit = async (values: Omit<Address, "id">) => {
    try {
      if (addressToEdit) {
        await updateMutation.mutateAsync({
          id: addressToEdit.id,
          updates: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      handleDialogClose();
    } catch (err) {
      console.error("Failed to submit address:", err);
    }
  };

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs text-center">
        <p className="text-sm text-destructive font-medium">Failed to load addresses.</p>
        <Button
          type="button"
          onClick={() => void refetch()}
          variant="link"
          className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer h-auto p-0"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-border/60 pb-5 mb-6">
        <h2 className="text-xl font-bold text-foreground">Address Book</h2>
        <Button
          type="button"
          onClick={handleAddClick}
          className="font-semibold px-4 py-2 h-auto text-sm cursor-pointer shadow-xs"
        >
          Add New Address
        </Button>
      </div>

      {/* Address List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading addresses...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-muted/10">
          <MapPin className="size-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium">No addresses saved yet.</p>
          <Button
            type="button"
            onClick={handleAddClick}
            variant="link"
            className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer h-auto p-0"
          >
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-lg border border-border p-5 bg-card hover:shadow-xs transition-shadow flex flex-col gap-2"
            >
              {/* Name & Badge Row */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-foreground leading-tight">
                  {address.fullName}
                </span>
                {address.isDefault && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <span className="text-sm text-foreground/80 leading-normal">
                {address.phoneNumber}
              </span>

              {/* Address Details */}
              <p className="text-sm leading-relaxed text-muted-foreground mt-0.5">
                {address.streetAddress}, {address.building}
                {address.landmark && `, ${address.landmark}`}
                {`, ${address.city}, Saudi Arabia`}
              </p>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  type="button"
                  onClick={() => handleEditClick(address)}
                  variant="outline"
                  className="gap-1.5 px-3 py-1.5 h-auto text-xs font-bold"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDeleteClick(address.id)}
                  variant="outline"
                  className="gap-1.5 px-3 py-1.5 h-auto text-xs font-bold text-destructive hover:bg-destructive/5 hover:border-destructive/20"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Edit/Create Modal */}
      <AddressDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        addressToEdit={addressToEdit}
        onSubmit={handleDialogSubmit}
        isPending={isPending}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => !open && setIsDeleteConfirmOpen(false)}
      >
        <DialogContent className="max-w-md bg-card border-border p-6 shadow-lg rounded-xl gap-0">
          <DialogHeader className="border-b border-border pb-4 mb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Address
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-4 py-2.5 h-auto text-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              {deleteMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
            <Button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={deleteMutation.isPending}
              variant="outline"
              className="flex-1 font-semibold px-4 py-2.5 h-auto text-sm cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
