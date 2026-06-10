"use client";

import { useState, useEffect } from "react";
import { Inbox, ArrowUpDown, Download, Search, Loader2 } from "lucide-react";
import { AuctionPagination } from "@/features/auctions";
import type { SellerAuctionSummaryDto } from "@/features/seller";
import { SellerAuctionsTableRow } from "./SellerAuctionsTableRow";
import { ConfirmActionDialog } from "@/components/dialogs/confirm-action-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPillBar, type StatusPillItem } from "@/components/ui/status-pill-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportSellerDashboardData,
  downloadCsvFile,
} from "@/features/seller/api/seller-dashboard.api";

const SORT_OPTIONS = [
  { value: "EndTime", label: "Ending Soon" },
  { value: "CreationDate", label: "Recently Created" },
  { value: "bidsCount", label: "Most Bids" },
  { value: "lastBidAmount", label: "Highest Bid" },
] as const;

const TABLE_HEADERS = [
  { key: "auction", label: "Auction", className: "" },
  { key: "category", label: "Category", className: "" },
  { key: "status", label: "Status", className: "" },
  { key: "bids", label: "Bids", className: "" },
  { key: "currentBid", label: "Current Bid", className: "" },
  { key: "timeLeft", label: "Time Left", className: "" },
  { key: "endsAt", label: "Ends At", className: "" },
  { key: "actions", label: "Actions", className: "text-right pr-8" },
] as const;

interface SellerAuctionsTableProps {
  auctions: SellerAuctionSummaryDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  activeStatus: string;
  sortBy: string;
  searchTerm: string;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onDeleteAuction: (id: string) => Promise<void>;
  onSearchChange: (search: string) => void;
  allCount: number;
  activeCount: number;
  pendingCount: number;
  soldCount: number;
  unsoldCount: number;
}

export function SellerAuctionsTable({
  auctions,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  activeStatus,
  sortBy,
  searchTerm,
  onStatusChange,
  onSortChange,
  onPageChange,
  onDeleteAuction,
  onSearchChange,
  allCount,
  activeCount,
  pendingCount,
  soldCount,
  unsoldCount,
}: SellerAuctionsTableProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);

  // Local debounced search
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchTerm) {
        onSearchChange(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, searchTerm, onSearchChange]);

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

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: string) => {
    setIsExporting(true);
    try {
      const blob = await exportSellerDashboardData(type, {
        Status: activeStatus === "All" ? undefined : activeStatus,
        SearchTerm: searchTerm || undefined,
        SortBy: sortBy,
      });
      downloadCsvFile(blob, `seller-${type}-${new Date().toISOString().split("T")[0]}.csv`);
    } catch {
      // Export failed silently
    } finally {
      setIsExporting(false);
    }
  };

  const statusPills: StatusPillItem[] = [
    { key: "All", label: "All", count: allCount, color: "var(--primary)" },
    { key: "Active", label: "Active", count: activeCount, color: "#10b981" },
    { key: "Pending", label: "Pending", count: pendingCount, color: "#f59e0b" },
    { key: "Sold", label: "Sold", count: soldCount, color: "#3b82f6" },
    { key: "Unsold", label: "Unsold", count: unsoldCount, color: "#64748b" },
  ];

  return (
    <div className="space-y-5">

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search auctions by title..."
          className="pl-9 h-9 text-xs bg-card border-border focus-visible:ring-primary/20"
        />
      </div>

      {/* Toolbar: Status Pills + Sort + Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <StatusPillBar
          items={statusPills}
          activeKey={activeStatus}
          onSelect={onStatusChange}
        />

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Sort Select */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="cursor-pointer">
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by" />
              </span>
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} className="cursor-pointer" value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-lg h-9 px-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer bg-card"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("auctions")}>
                Auctions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("orders")}>
                Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("financials")}>
                Financials
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border h-11 hover:bg-muted/30">
              {TABLE_HEADERS.map((header) => (
                <TableHead key={header.key} className={cn(
                  "px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
                  header.className
                )}>
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={rowIdx} className="animate-pulse border-0">
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-12 bg-muted rounded-lg shrink-0" />
                      <div className="space-y-1.5 w-24">
                        <div className="h-3.5 bg-muted rounded" />
                        <div className="h-2.5 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4"><div className="h-3 bg-muted rounded w-24" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-5 bg-muted rounded w-16" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-3 bg-muted rounded w-6" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-3 bg-muted rounded w-20" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-3 bg-muted rounded w-12" /></TableCell>
                  <TableCell className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-24" /></TableCell>
                  <TableCell className="px-5 py-4 text-right pr-8"><div className="h-8 bg-muted rounded-lg w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : auctions.length === 0 ? (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell colSpan={TABLE_HEADERS.length} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 max-w-xs mx-auto">
                    <Inbox className="h-8 w-8 text-muted-foreground/40" />
                    <h3 className="text-sm font-bold text-foreground">No auctions found</h3>
                    <p className="text-xs text-muted-foreground">
                      {localSearch
                        ? `No auctions matched "${localSearch}"`
                        : "No auctions match the selected filter."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              auctions.map((auction) => (
                <SellerAuctionsTableRow
                  key={auction.auctionId}
                  auction={auction}
                  onDelete={handleDeleteClick}
                />
              ))
              )}
            </TableBody>
          </Table>
        </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs font-medium text-muted-foreground text-left">
            Showing <span className="font-bold text-foreground">{Math.min(totalCount, (currentPage - 1) * 5 + 1)}</span> to{" "}
            <span className="font-bold text-foreground">{Math.min(totalCount, currentPage * 5)}</span> of{" "}
            <span className="font-bold text-foreground">{totalCount}</span> auctions
          </p>
          <AuctionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            hasPreviousPage={currentPage > 1}
            hasNextPage={currentPage < totalPages}
            className="w-full sm:w-auto"
          />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmActionDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
        title="Delete Auction Listing?"
        description="Are you sure you want to delete this auction? This action is permanent and cannot be undone. Bidders will lose access to this listing."
        confirmLabel="Delete Listing"
        variant="destructive"
        isLoading={isDeletingInProgress}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
