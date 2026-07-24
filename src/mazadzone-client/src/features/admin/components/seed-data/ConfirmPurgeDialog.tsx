import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Bomb } from "lucide-react";

export interface ConfirmPurgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurge: (purgeAll: boolean) => void;
  isPurging: boolean;
  totalAuctionCount: number;
  purgeAllMode?: boolean;
}

export function ConfirmPurgeDialog({
  isOpen,
  onClose,
  onConfirmPurge,
  isPurging,
  totalAuctionCount,
  purgeAllMode = true,
}: ConfirmPurgeDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const requiredKeyword = purgeAllMode ? "DELETE ALL AUCTIONS" : "DELETE MOCK SEEDS";

  const handleConfirm = () => {
    if (confirmationInput.trim().toUpperCase() === requiredKeyword) {
      onConfirmPurge(purgeAllMode);
      setConfirmationInput("");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md border-destructive/30 bg-card text-card-foreground">
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            {purgeAllMode ? <Bomb className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </div>
          <AlertDialogTitle className="text-center text-lg font-bold text-foreground">
            {purgeAllMode ? "💣 Delete ALL Database Auctions & Bids?" : "Purge Mock Seed Auctions?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-xs text-muted-foreground">
            {purgeAllMode ? (
              <>
                This operation will permanently wipe <span className="font-bold text-destructive">{totalAuctionCount} auctions</span> (both old and new mock entries) along with all bid history.
                <br />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-1">
                  ✓ Admin user accounts & core categories will remain completely safe.
                </span>
              </>
            ) : (
              <>
                This operation will purge <span className="font-semibold text-foreground">{totalAuctionCount} mock seed entries</span> from the database while leaving core system data untouched.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-3 space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground block text-center">
            Type <span className="font-mono font-bold text-destructive">{requiredKeyword}</span> to confirm:
          </label>
          <Input
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={requiredKeyword}
            className="font-mono text-xs uppercase text-center"
          />
        </div>

        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel onClick={onClose} disabled={isPurging} className="text-xs">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPurging || confirmationInput.trim().toUpperCase() !== requiredKeyword}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isPurging ? "Deleting Data..." : purgeAllMode ? "Delete All Auctions" : "Purge Seeds"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
