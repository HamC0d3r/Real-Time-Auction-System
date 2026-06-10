"use client";

import { useState } from "react";
import { Inbox, Download, Loader2, DollarSign, Percent, ShieldCheck, Box } from "lucide-react";
import { AuctionPagination } from "@/features/auctions";
import type { SellerOrderSummaryDto } from "@/features/seller";
import { SellerFinancialsTableRow } from "./SellerFinancialsTableRow";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetricStrip, type MetricStripItem } from "@/components/ui/metric-strip";
import { formatCurrency } from "@/utils/currency.utils";
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

const TABLE_HEADERS = [
  { key: "transactionId", label: "Transaction ID", className: "" },
  { key: "auction", label: "Auction Name", className: "" },
  { key: "completionDate", label: "Completion Date", className: "" },
  { key: "grossRevenue", label: "Gross Revenue", className: "" },
  { key: "platformFee", label: "Platform Fee (10%)", className: "" },
  { key: "netProfit", label: "Net Profit", className: "" },
  { key: "actions", label: "Action", className: "text-right pr-8" },
] as const;

interface SellerFinancialsTableProps {
  orders: SellerOrderSummaryDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  // Financial metrics from API response
  grossRevenue: number;
  platformFees: number;
  netProfit: number;
  completedCount: number;
}

export function SellerFinancialsTable({
  orders,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  grossRevenue,
  platformFees,
  netProfit,
  completedCount,
}: SellerFinancialsTableProps) {

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: string) => {
    setIsExporting(true);
    try {
      const blob = await exportSellerDashboardData(type);
      downloadCsvFile(blob, `seller-${type}-${new Date().toISOString().split("T")[0]}.csv`);
    } catch {
      // Export failed silently
    } finally {
      setIsExporting(false);
    }
  };

  const financialMetrics: MetricStripItem[] = [
    {
      label: "Gross Revenue",
      value: formatCurrency(grossRevenue),
      subtext: "Cumulative sales volume",
      icon: DollarSign,
      iconClassName: "text-emerald-500",
    },
    {
      label: "Platform Fees",
      value: formatCurrency(platformFees),
      subtext: "5% standard platform cut",
      icon: Percent,
      iconClassName: "text-red-500",
    },
    {
      label: "Net Profit",
      value: formatCurrency(netProfit),
      subtext: "Total earnings after fees",
      icon: ShieldCheck,
      iconClassName: "text-emerald-500",
    },
    {
      label: "Completed Sales",
      value: String(completedCount),
      subtext: "Total fulfilled orders",
      icon: Box,
      iconClassName: "text-blue-500",
    },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Financial Overview Strip */}
      <MetricStrip items={financialMetrics} isLoading={isLoading} />

      {/* Transactions Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-left space-y-0.5">
            <h3 className="text-base font-bold tracking-tight text-foreground">Completed Transactions</h3>
            <p className="text-xs text-muted-foreground">Individual audit ledger of successful payouts</p>
          </div>
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

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border hover:bg-muted/30">
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
                Array.from({ length: 3 }).map((_, rowIdx) => (
                  <TableRow key={rowIdx} className="animate-pulse border-0">
                    <TableCell className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-16" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-32" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-24" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-20" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-20" /></TableCell>
                    <TableCell className="px-5 py-4"><div className="h-3.5 bg-muted rounded w-20" /></TableCell>
                    <TableCell className="px-5 py-4 text-right pr-8"><div className="h-5 bg-muted rounded w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={TABLE_HEADERS.length} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 max-w-xs mx-auto">
                      <Inbox className="h-8 w-8 text-muted-foreground/40" />
                      <h3 className="text-sm font-bold text-foreground">No completed payouts found</h3>
                      <p className="text-xs text-muted-foreground">
                        Complete active auctions and receive buyer orders to trigger payouts.
                      </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <SellerFinancialsTableRow
                  key={order.orderId}
                  order={order}
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
              <span className="font-bold text-foreground">{totalCount}</span> payout items
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

    </div>
  );
}
