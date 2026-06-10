"use client";

import React, { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { ModerateAuctionsFilters } from "./ModerateAuctionsFilters";
import { ModerateAuctionsTable } from "./ModerateAuctionsTable";
import {
  useModerateAuctions,
  exportAuctionsApi,
  type UseModerateAuctionsFilters,
} from "../../api";
import { useAppToast } from "@/lib/toast/app-toast";
import type { AuctionStatus } from "../../types/admin.types";

export function ModerateAuctionsPage() {
  const { searchParams, setFilters } = useUrlFilters<UseModerateAuctionsFilters>();

  const filters = useMemo<UseModerateAuctionsFilters>(() => {
    return {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "All Categories",
      status:
        (searchParams.get("status") as AuctionStatus | "All Statuses") ||
        "Active",
      sortBy: searchParams.get("sortBy") || "dateCreated",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      dateFrom: searchParams.get("dateFrom") || "",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
    };
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const appToast = useAppToast();

  const { data, isLoading } = useModerateAuctions(filters);

  const handleFilterChange = (newFilters: Partial<UseModerateAuctionsFilters>) => {
    setFilters(newFilters);
    setSelectedIds([]); // Clear selection when filters change
  };

  const handlePageChange = (page: number) => {
    setFilters({ page } as Partial<UseModerateAuctionsFilters>);
    setSelectedIds([]);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ pageSize, page: 1 } as Partial<UseModerateAuctionsFilters>);
    setSelectedIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedIds(data.data.map((auction) => auction.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportAuctionsApi(filters, selectedIds);

      // Client-side download trigger
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const dateStr = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `mazadzone_auctions_export_${dateStr}.csv`);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      appToast.success("Export Successful", "Your auction data export has been downloaded.");
    } catch (error) {
      console.error("Export failed", error);
      appToast.error("Export Failed", "There was an error generating your export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Moderate Auctions
          </h1>
          <span title="Review and manage auction listings across the platform.">
            <Info className="h-5 w-5 text-muted-foreground cursor-help opacity-70 hover:opacity-100 transition-opacity" />
          </span>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Review and manage auction listings across the platform.
        </p>
      </div>

      {/* Filters Bar */}
      <ModerateAuctionsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isExporting={isExporting}
        onExport={handleExport}
        selectedIds={selectedIds}
      />

      {/* Data Table */}
      <ModerateAuctionsTable
        auctions={data?.data || []}
        isLoading={isLoading}
        page={filters.page}
        pageSize={filters.pageSize}
        totalPages={data?.totalPages || 1}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
      />
    </div>
  );
}
