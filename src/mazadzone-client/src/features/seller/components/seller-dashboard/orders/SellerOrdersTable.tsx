"use client";

import { useState, useEffect } from "react";
import { Inbox, ArrowUpDown, Download, Search } from "lucide-react";
import { AuctionPagination } from "@/features/auctions";
import type { SellerOrderSummaryDto } from "@/features/seller";
import { SellerOrdersTableRow } from "./SellerOrdersTableRow";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPillBar, type StatusPillItem } from "@/components/ui/status-pill-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "OrderDate", label: "Order Date" },
  { value: "TotalAmount", label: "Total Amount" },
] as const;

const TABLE_HEADERS = [
  { key: "orderId", label: "Order ID", className: "" },
  { key: "auction", label: "Auction Name", className: "" },
  { key: "bidder", label: "Bidder", className: "" },
  { key: "status", label: "Status", className: "" },
  { key: "orderDate", label: "Order Date", className: "" },
  { key: "totalAmount", label: "Total Amount", className: "" },
] as const;

interface SellerOrdersTableProps {
  orders: SellerOrderSummaryDto[];
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
  onSearchChange: (search: string) => void;
  // Stats counters to build the pills row
  allCount: number;
  pendingCount: number;
  shippedCount: number;
  deliveredCount: number;
  completedCount: number;
  canceledCount: number;
}

export function SellerOrdersTable({
  orders,
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
  onSearchChange,
  allCount,
  pendingCount,
  shippedCount,
  deliveredCount,
  completedCount,
  canceledCount,
}: SellerOrdersTableProps) {
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

  const statusPills: StatusPillItem[] = [
    { key: "All", label: "All", count: allCount, color: "var(--primary)" },
    { key: "Pending", label: "Pending", count: pendingCount, color: "#f59e0b" },
    { key: "Shipped", label: "Shipped", count: shippedCount, color: "#3b82f6" },
    { key: "Delivered", label: "Delivered", count: deliveredCount, color: "#06b6d4" },
    { key: "Completed", label: "Completed", count: completedCount, color: "#10b981" },
    { key: "Canceled", label: "Canceled", count: canceledCount, color: "#ef4444" },
  ];

  return (
    <div className="space-y-5">

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search orders by auction title or bidder..."
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

          {/* Export Button */}
          <Button
            variant="outline"
            className="rounded-lg h-9 px-3.5 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-muted/30 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-11">
              {TABLE_HEADERS.map((header) => (
                <th key={header.key} className={cn("px-5 py-3", header.className)}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="animate-pulse">
                  <td className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-16" /></td>
                  <td className="px-5 py-4">
                    <div className="space-y-1.5 w-24">
                      <div className="h-3.5 bg-muted rounded" />
                      <div className="h-2.5 bg-muted rounded w-16" />
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-24" /></td>
                  <td className="px-5 py-4"><div className="h-5 bg-muted rounded w-16" /></td>
                  <td className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-24" /></td>
                  <td className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-20" /></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 max-w-xs mx-auto">
                    <Inbox className="h-8 w-8 text-muted-foreground/40" />
                    <h3 className="text-sm font-bold text-foreground">No orders found</h3>
                    <p className="text-xs text-muted-foreground">
                      {localSearch
                        ? `No orders matched "${localSearch}"`
                        : "No orders match the selected filter."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <SellerOrdersTableRow
                  key={order.orderId}
                  order={order}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs font-medium text-muted-foreground text-left">
            Showing <span className="font-bold text-foreground">{Math.min(totalCount, (currentPage - 1) * 5 + 1)}</span> to{" "}
            <span className="font-bold text-foreground">{Math.min(totalCount, currentPage * 5)}</span> of{" "}
            <span className="font-bold text-foreground">{totalCount}</span> orders
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
    </div>
  );
}
