"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModerateUsersPagination } from "../../admin/components/users/ModerateUsersPagination";
import { ViewDisputeSheet } from "./ViewDisputeSheet";
import type { DisputeListItemDto } from "../api/disputes.contracts";
import { format } from "date-fns";

interface AdminDisputesTableProps {
  data: DisputeListItemDto[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function getStatusBadgeVariant(status: string) {
  const s = status.toLowerCase().replace(/\s+/g, "-");
  if (s === "open") return "info";
  if (s === "under-review") return "review";
  if (s === "awaiting-response") return "warning";
  if (s === "resolved") return "success";
  if (s === "rejected") return "destructive";
  return "outline";
}

function formatSubmittedDate(raw: string): string {
  try {
    return format(new Date(raw), "MMM d, yyyy h:mm a");
  } catch {
    return raw;
  }
}

export function AdminDisputesTable({
  data,
  isLoading,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: AdminDisputesTableProps) {
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading disputes...</div>;
  }

  if (!data.length) {
    return <div className="p-8 text-center text-muted-foreground">No disputes found matching criteria.</div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/30">
            <TableHead className="w-12 text-center">
              <Checkbox className="rounded-[4px] border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            </TableHead>
            <TableHead className="font-bold text-foreground">Parties</TableHead>
            <TableHead className="font-bold text-foreground">Dispute Type</TableHead>
            <TableHead className="font-bold text-foreground">Status</TableHead>
            <TableHead className="font-bold text-foreground">Submitted Date</TableHead>
            <TableHead className="font-bold text-foreground text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dispute) => (
            <TableRow key={dispute.id} className="group">
              <TableCell className="text-center align-middle">
                <Checkbox className="rounded-[4px] border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{dispute.bidderName}</span>
                  <span className="text-sm text-muted-foreground">vs</span>
                  <span className="text-sm font-bold">{dispute.sellerName}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium">
                {dispute.category}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(dispute.status) as any}>
                  {dispute.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">{formatSubmittedDate(dispute.submittedDate)}</span>
              </TableCell>
              <TableCell className="text-right pr-4 align-middle">
                <div className="flex items-center justify-end gap-2 ml-auto w-[80px]">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full font-bold text-xs bg-card hover:bg-muted"
                    onClick={() => setSelectedDisputeId(dispute.id)}
                  >
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedDisputeId(dispute.id)}>
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!isLoading && data.length > 0 && (
        <ModerateUsersPagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      {selectedDisputeId && (
        <ViewDisputeSheet
          disputeId={selectedDisputeId}
          isOpen={!!selectedDisputeId}
          onClose={() => setSelectedDisputeId(null)}
        />
      )}
    </div>
  );
}
