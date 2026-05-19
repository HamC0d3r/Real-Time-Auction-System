"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isConfirming,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-card border border-border text-card-foreground rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6 text-left animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">
              Delete Auction Listing?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete this auction? This action is permanent and cannot be undone. Bidders will lose access to this listing.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
          <Button
            variant="outline"
            disabled={isConfirming}
            onClick={onClose}
            className="rounded-xl h-11 px-5 font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            disabled={isConfirming}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl h-11 px-5 font-extrabold cursor-pointer flex items-center gap-1.5"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Listing"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
