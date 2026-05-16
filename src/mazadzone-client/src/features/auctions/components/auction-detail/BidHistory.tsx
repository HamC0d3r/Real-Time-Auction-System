import { Gavel } from "lucide-react";
import { BidHistoryRow } from "./BidHistoryRow";
import type { BidHistoryEntry } from "../../types/auction.types";

interface BidHistoryProps {
  bidHistory: BidHistoryEntry[];
  totalBids: number;
}

export function BidHistory({ bidHistory, totalBids }: BidHistoryProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Gavel className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">
            Bid History
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {totalBids} bids
        </span>
      </div>

      {/* Bid list */}
      <div className="max-h-[560px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40">
        {bidHistory.length > 0 ? (
          bidHistory.map((entry) => (
            <BidHistoryRow key={entry.id} entry={entry} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Gavel className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              No Bids Yet !
            </h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              🚀 Be the first bidder and start the action!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
