"use client";

import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { ViewAction } from "@/components/ui/view-action";
import { formatCurrency } from "@/utils/currency.utils";
import { ROUTES } from "@/config/routes.config";
import type { SellerOrderSummaryDto } from "@/features/seller";

interface SellerFinancialsTableRowProps {
  order: SellerOrderSummaryDto;
}

export function SellerFinancialsTableRow({ order }: SellerFinancialsTableRowProps) {
  
  // Format Order ID for visual elegance
  const shortTransactionId = order.orderId.substring(0, 8).toUpperCase();

  // Compute standard 10% platform fee for local visual breakdown
  const grossAmount = order.totalAmount;
  const platformFee = grossAmount * 0.10; // 10% standard platform fee
  const netProfit = grossAmount - platformFee;

  return (
    <TableRow className="hover:bg-accent/20 dark:hover:bg-accent/5 transition-colors h-[64px] border-0">
      
      {/* Column 1: Transaction ID */}
      <TableCell className="px-6 py-3 font-mono font-black text-xs text-foreground tracking-wider">
        #{shortTransactionId}
      </TableCell>

      {/* Column 2: Auction Title */}
      <TableCell className="px-6 py-3 min-w-[200px]">
        <div className="text-left font-black text-xs text-foreground truncate max-w-[220px]">
          {order.auctionTitle}
        </div>
      </TableCell>

      {/* Column 3: Completion Date */}
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

      {/* Column 4: Gross Revenue */}
      <TableCell className="px-6 py-3 font-black text-xs text-foreground">
        {formatCurrency(grossAmount)}
      </TableCell>

      {/* Column 5: Platform Fee (10%) */}
      <TableCell className="px-6 py-3 font-semibold text-xs text-red-500">
        -{formatCurrency(platformFee)}
      </TableCell>

      {/* Column 6: Net Profit */}
      <TableCell className="px-6 py-3 font-black text-xs text-emerald-500">
        {formatCurrency(netProfit)}
      </TableCell>

      {/* Column 7: Actions */}
      <TableCell className="px-6 py-3 text-right pr-8">
        <ViewAction href={ROUTES.AUCTIONS.DETAIL(order.auctionId)} />
      </TableCell>
    </TableRow>
  );
}
