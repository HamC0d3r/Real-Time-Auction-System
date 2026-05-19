"use client";

import { useState } from "react";
import { Clock, Inbox, Filter, ArrowUpDown } from "lucide-react";
import type { AuctionSummary } from "../../types/auction.types";
import { AuctionPagination } from "../auction-pagination";
import { SellerAuctionsTableRow } from "./SellerAuctionsTableRow";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Config definitions for dynamic rendering
const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Sold", label: "Sold" },
  { value: "Pending", label: "Pending" },
  { value: "Ended", label: "Ended (Unsold)" },
] as const;

const SORT_OPTIONS = [
  { value: "EndDate", label: "End Date" },
  { value: "CurrentBid", label: "Last Bid" },
  { value: "DateCreated", label: "Date Created" },
] as const;

const TABLE_HEADERS = [
  { key: "auction", label: "Auction", className: "" },
  { key: "status", label: "Status", className: "" },
  { key: "bids", label: "Bids", className: "" },
  { key: "lastBid", label: "Last Bid", className: "" },
  { key: "endDate", label: "End Date", className: "" },
  { key: "actions", label: "Actions", className: "text-right" },
] as const;

interface SellerAuctionsTableProps {
  auctions: AuctionSummary[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  activeStatus: string;
  sortBy: string;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onDeleteAuction: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function SellerAuctionsTable({
  auctions,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  activeStatus,
  sortBy,
  onStatusChange,
  onSortChange,
  onPageChange,
  onDeleteAuction,
  isDeleting,
}: SellerAuctionsTableProps) {
  // Modal/Confirm dialog states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeletingInProgress(true);
    try {
      await onDeleteAuction(deleteTargetId);
    } finally {
      setIsDeletingInProgress(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm space-y-6">

      {/* Table Controls / Filter & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Recent Auctions
          </h2>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Status Filter */}
          <Select value={activeStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[220px] rounded-full text-lg h-11 bg-card hover:bg-accent border border-border hover:border-primary/50 transition-all font-semibold px-4 cursor-pointer flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Statuses" />
              </span>
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5} className="rounded-xl">
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} className="text-lg rounded-lg font-medium" value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By Dropdown */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[250px] rounded-full text-lg h-11 bg-card hover:bg-accent border border-border hover:border-primary/50 transition-all font-semibold px-4 cursor-pointer flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by" />
              </span>
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5} className="rounded-xl">
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} className="text-lg rounded-lg font-medium" value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border/80 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {TABLE_HEADERS.map((header) => (
                <th key={header.key} className={cn("px-6 py-4", header.className)}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="animate-pulse">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 bg-muted rounded-lg shrink-0" />
                      <div className="space-y-1.5 w-32">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-20" />
                      </div>
                    </div>
                  </td>
                  {/* Status, Bids, Last Bid, End Date, Actions skeletons */}
                  {Array.from({ length: 5 }).map((_, colIdx) => (
                    <td key={colIdx} className={cn("px-6 py-5", colIdx === 4 && "text-right")}>
                      <div
                        className={cn(
                          "h-4 bg-muted rounded",
                          colIdx === 0 && "h-6 w-16",
                          colIdx === 1 && "w-8",
                          colIdx === 2 && "w-16",
                          colIdx === 3 && "w-24",
                          colIdx === 4 && "h-8 w-24 ml-auto"
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : auctions.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                    <Inbox className="h-10 w-10 text-muted-foreground" />
                    <h3 className="text-lg font-bold">No auctions found</h3>
                    <p className="text-sm text-muted-foreground">
                      We couldn&apos;t find any auctions matching the selected status filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              auctions.map((auction) => (
                <SellerAuctionsTableRow
                  key={auction.id}
                  auction={auction}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="border-t border-border/40 pt-6 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold text-muted-foreground">
            Showing Page <span className="font-bold text-foreground">{currentPage}</span> of{" "}
            <span className="font-bold text-foreground">{totalPages}</span> ({totalCount} items)
          </p>
          <AuctionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            hasPreviousPage={currentPage > 1}
            hasNextPage={currentPage < totalPages}
            className="w-full"
          />
        </div>
      )}

      {/* Premium Confirm Delete Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeletingInProgress}
      />
    </div>
  );
}
