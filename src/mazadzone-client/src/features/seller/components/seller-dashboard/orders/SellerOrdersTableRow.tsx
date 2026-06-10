"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ViewAction } from "@/components/ui/view-action";
import { formatCurrency } from "@/utils/currency.utils";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";
import type { SellerOrderSummaryDto } from "@/features/seller";

interface SellerOrdersTableRowProps {
  order: SellerOrderSummaryDto;
}

export function SellerOrdersTableRow({ order }: SellerOrdersTableRowProps) {
  // Status styling configurations
  const getStatusDetails = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") {
      return {
        label: "Pending",
        styles:
          "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
      };
    }
    if (s === "shipped") {
      return {
        label: "Shipped",
        styles:
          "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
      };
    }
    if (s === "delivered") {
      return {
        label: "Delivered",
        styles:
          "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/30",
      };
    }
    if (s === "completed" || s === "success") {
      return {
        label: "Completed",
        styles:
          "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
      };
    }
    if (s === "canceled" || s === "refunded" || s === "cancelled") {
      return {
        label: "Canceled",
        styles:
          "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30",
      };
    }
    return {
      label: status,
      styles:
        "bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-900/30",
    };
  };

  const statusInfo = getStatusDetails(order.orderStatus);

  return (
    <TableRow className="hover:bg-accent/20 dark:hover:bg-accent/5 transition-colors h-[64px] border-0">
      {/* Column 1: Auction Title */}
      <TableCell className="px-6 py-3 min-w-[200px]">
        <div className="text-left">
          <h4 className="text-xs font-black text-foreground truncate max-w-[180px] sm:max-w-[260px]">
            {order.auctionTitle}
          </h4>
        </div>
      </TableCell>

      {/* Column 2: Bidder */}
      <TableCell className="px-6 py-3 min-w-[150px]">
        <span className="text-xs font-semibold text-foreground truncate max-w-[150px] block">
          {order.bidderName}
        </span>
      </TableCell>

      {/* Column 3: Status Badge */}
      <TableCell className="px-6 py-3">
        <Badge
          className={cn(
            "px-2.5 py-0.5 rounded-full border shadow-none text-[10px] font-black uppercase tracking-wider",
            statusInfo.styles,
          )}
        >
          {statusInfo.label}
        </Badge>
      </TableCell>

      {/* Column 4: Order Date */}
      <TableCell className="px-6 py-3">
        <div className="space-y-0.5 text-left text-[11px] font-semibold">
          <div className="text-foreground">
            {format(new Date(order.orderDateUtc), "MMM d, yyyy")}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {format(new Date(order.orderDateUtc), "h:mm a")}
          </div>
        </div>
      </TableCell>

      {/* Column 5: Total Amount */}
      <TableCell className="px-6 py-3 font-black text-xs text-foreground">
        {formatCurrency(order.totalAmount)}
      </TableCell>

      {/* Column 6: Actions */}
      <TableCell className="px-6 py-3 text-right pr-8">
        <ViewAction href={ROUTES.ORDERS.DETAIL(order.orderId)} />
      </TableCell>
    </TableRow>
  );
}
