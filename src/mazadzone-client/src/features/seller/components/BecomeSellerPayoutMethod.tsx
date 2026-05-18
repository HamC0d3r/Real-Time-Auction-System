"use client";

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  Plus,
  X,
  ShieldCheck,
  Trash2,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Import payment feature types
import { type PayoutDetails } from "@/features/payment";

interface BecomeSellerPayoutMethodProps {
  onPayoutAdded: (details: PayoutDetails | null) => void;
  payoutDetails: PayoutDetails | null;
  onOpenDrawer: () => void; // Triggered when add/edit is clicked
}

export function BecomeSellerPayoutMethod({
  onPayoutAdded,
  payoutDetails,
  onOpenDrawer
}: BecomeSellerPayoutMethodProps) {
  const [showWhyBanner, setShowWhyBanner] = useState(true);

  const handleRemove = () => {
    onPayoutAdded(null);
  };

  return (
    <div className="space-y-6">
      {/* Heading Block */}
      <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
        <Wallet className="h-5 w-5 text-primary shrink-0" />
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Payout Method
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            Add how you want to receive your money after a successful sale.
          </p>
        </div>
      </div>

      {/* Box layout for adding / added Payout method */}
      {!payoutDetails ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/5">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary shrink-0 shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-foreground text-[15px]">
                No payout method added yet
              </p>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold mt-0.5">
                Add a payout method to get paid for your sold items.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={onOpenDrawer}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 rounded-xl h-12 font-bold px-6 shrink-0 transition-colors gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-3" />
            Add Payout Method
          </Button>
        </div>
      ) : (
        <div className="border border-emerald-500/30 rounded-2xl p-5 md:p-6 flex items-center justify-between gap-4 bg-emerald-500/0.02">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-[15px]">
                  Credit Card
                </span>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
                  Active
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-semibold mt-1">
                {`${payoutDetails.cardType || "Card"} ending in ${payoutDetails.cardNumber?.replace(/\s/g, "").slice(-4)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onOpenDrawer}
              variant="outline"
              className="text-xs font-bold rounded-lg h-9 px-3 border border-border cursor-pointer hover:bg-muted"
            >
              Edit
            </Button>
            <Button
              type="button"
              onClick={handleRemove}
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl h-10 w-10 flex items-center justify-center cursor-pointer p-0"
              title="Remove payout method"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dismissible Banner why do we need this */}
      {showWhyBanner && (
        <div className="bg-[#EBF7F2] dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 relative animate-fade-in text-left">
          <button
            type="button"
            onClick={() => setShowWhyBanner(false)}
            className="absolute top-4 right-4 text-emerald-800/60 dark:text-emerald-400/60 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
          
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 pr-6">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                Why do I need to add a payout method?
              </h4>
              <p className="text-xs md:text-sm text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed font-semibold">
                To list items on MazadZone, a valid payout method is required. We automatically distribute successful auction earnings directly to this card via Stripe once the buyer confirms delivery.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
