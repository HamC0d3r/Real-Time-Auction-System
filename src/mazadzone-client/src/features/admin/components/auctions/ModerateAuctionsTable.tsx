import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";

import { Eye, XCircle, Gavel } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ModerateAuction, AuctionStatus } from "../../types/admin.types";
import { MODERATE_AUCTION_COLUMNS } from "../../constants/moderate-auctions.constants";
import { ModerateUsersPagination } from "../users/ModerateUsersPagination";
import { CancelAuctionDialog } from "./CancelAuctionDialog";
import { formatCurrency } from "@/utils/currency.utils";
import { useGetAuctionById } from "@/features/auctions";

interface ModerateAuctionsTableProps {
  auctions: ModerateAuction[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
}

/** Returns design-token Tailwind classes for each auction status */
function getStatusBadgeClass(status: AuctionStatus): string {
  switch (status) {
    case "Active":
      return "bg-success text-success-foreground border-success";
    case "Pending":
      return "bg-upcoming text-upcoming-foreground border-upcoming";
    case "Ended":
      return "bg-muted text-muted-foreground border-muted";
    case "Cancelled":
      return "bg-warning text-warning-foreground border-warning";
    default:
      return "bg-secondary text-secondary-foreground border-secondary";
  }
}

function SellerInfoCell({ auctionId }: { auctionId: string }) {
  const { data: auction, isLoading, isError } = useGetAuctionById(auctionId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 py-1">
        <div className="h-3 w-20 rounded bg-muted/60 animate-pulse" />
        <div className="h-2.5 w-28 rounded bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (isError || !auction || !auction.seller) {
    return (
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] font-semibold text-muted-foreground whitespace-nowrap">
          N/A
        </span>
        <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap">
          Seller details missing
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">
        {auction.seller.fullName}
      </span>
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
        {auction.seller.email}
      </span>
    </div>
  );
}

export function ModerateAuctionsTable({
  auctions,
  isLoading,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  selectedIds,
  onSelectAll,
  onSelectRow,
}: ModerateAuctionsTableProps) {
  const router = useRouter();
  const [actionAuction, setActionAuction] = useState<ModerateAuction | null>(null);
  const [actionType, setActionType] = useState<"cancel" | null>(null);

  const handleActionClick = (
    type: "view" | "cancel",
    auction: ModerateAuction
  ) => {
    if (type === "cancel") {
      setActionAuction(auction);
      setActionType("cancel");
    } else if (type === "view") {
      router.push(ROUTES.AUCTIONS.DETAIL(auction.id));
    }
  };

  const isAllSelected =
    auctions.length > 0 && selectedIds.length === auctions.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < auctions.length;

  /** Generate context-aware action buttons per row */
  const getActionButtons = (auction: ModerateAuction) => {
    const isViewOnly = auction.status === "Ended" || auction.status === "Cancelled";
    const actions: {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      variant: "default" | "outline";
      className: string;
      type: "view" | "cancel";
    }[] = [];

    // View is always present
    actions.push({
      label: "View",
      icon: Eye,
      variant: "default",
      className:
        cn(
          "bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-transparent",
          isViewOnly ? "w-[131px]" : "w-[60px]"
        ),
      type: "view",
    });

    // Cancel is present for Active/Pending
    if (auction.status === "Active" || auction.status === "Pending") {
      actions.push({
        label: "Cancel",
        icon: XCircle,
        variant: "outline",
        className:
          "text-destructive border-destructive/20 bg-destructive/10 hover:bg-destructive/20 shadow-none w-[65px]",
        type: "cancel",
      });
    }

    return actions;
  };

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col w-full overflow-hidden shadow-xs">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b-border">
              <TableHead className="w-12 text-center pl-4">
                <Checkbox
                  className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-primary"
                  checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                />
              </TableHead>
              {MODERATE_AUCTION_COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                    col.align === "right" && "text-right pr-12",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 8 }).map((_, idx) => (
                <TableRow key={idx} className="border-b-border">
                  <TableCell className="w-12 pl-4">
                    <div className="h-4 w-4 rounded bg-muted/50 animate-pulse" />
                  </TableCell>
                  {MODERATE_AUCTION_COLUMNS.map((col) => (
                    <TableCell key={col.key}>
                      <div className="h-4 rounded bg-muted/50 animate-pulse w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : auctions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={MODERATE_AUCTION_COLUMNS.length + 1}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Gavel className="h-8 w-8 opacity-30" />
                    <p className="text-sm font-medium">No auctions found.</p>
                    <p className="text-xs opacity-70">
                      Try adjusting your filters or search query.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              auctions.map((auction) => (
                <TableRow
                  key={auction.id}
                  className="hover:bg-muted/10 border-b-border group align-middle"
                >
                  {/* Checkbox */}
                  <TableCell className="w-12 text-center pl-4">
                    <Checkbox
                      className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-primary"
                      checked={selectedIds.includes(auction.id)}
                      onCheckedChange={(checked) =>
                        onSelectRow(auction.id, checked as boolean)
                      }
                    />
                  </TableCell>

                  {/* Auction: image + title + ID */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {auction.imageUrl ? (
                          <img
                            src={auction.imageUrl}
                            alt={auction.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Gavel className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                          {auction.title}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Seller */}
                  <TableCell>
                    <SellerInfoCell auctionId={auction.id} />
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                      {auction.category}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-wide min-w-[72px] text-center justify-center",
                        getStatusBadgeClass(auction.status)
                      )}
                    >
                      {auction.status}
                    </Badge>
                  </TableCell>

                  {/* Current Price */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(auction.currentBid)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Bid Count */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-foreground">
                        {auction.bidCount}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Bids
                      </span>
                    </div>
                  </TableCell>

                  {/* Start Date */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
                        {format(new Date(auction.startDate), "MMM d, yyyy")}
                      </span>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(auction.startDate), "h:mm a")}
                      </span>
                    </div>
                  </TableCell>

                  {/* End Date */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-foreground whitespace-nowrap">
                        {format(new Date(auction.endDate), "MMM d, yyyy")}
                      </span>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(auction.endDate), "h:mm a")}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center py-2 align-middle">
                    <div className="flex items-center justify-center gap-1.5">
                      {getActionButtons(auction).map((action, idx) => {
                        const Icon = action.icon;
                        return (
                          <Button
                            key={idx}
                            variant={action.variant}
                            onClick={() => handleActionClick(action.type, auction)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-1 h-[52px] px-2 shadow-none rounded-lg shrink-0 cursor-pointer",
                              action.className
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-[10px] font-semibold leading-none">
                              {action.label}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <ModerateUsersPagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Cancel Dialog */}
      <CancelAuctionDialog
        isOpen={actionAuction !== null && actionType === "cancel"}
        onClose={() => {
          setActionAuction(null);
          setActionType(null);
        }}
        auction={actionAuction}
      />
    </div>
  );
}
