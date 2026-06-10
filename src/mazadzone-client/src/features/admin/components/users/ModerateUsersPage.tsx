"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { Info } from "lucide-react";
import { ModerateUsersFilters } from "./ModerateUsersFilters";
import { ModerateUsersTable } from "./ModerateUsersTable";
import {
  useModerateUsers,
  type UseModerateUsersFilters,
  exportUsersApi,
  useBulkActivateUsers,
  useBulkSuspendUsers,
  useBulkBanUsers,
} from "../../api";
import { useAppToast } from "@/lib/toast/app-toast";
import type { ModerateUserRole, ModerateUserStatus } from "../../types/admin.types";

export function ModerateUsersPage() {
  const { searchParams, setFilters } = useUrlFilters<UseModerateUsersFilters>();

  const search = searchParams.get("search") || "";
  const role = (searchParams.get("role") as ModerateUserRole | "All Roles") || "All Roles";
  const status = (searchParams.get("status") as ModerateUserStatus | "All Statuses") || "All Statuses";
  const sortBy = searchParams.get("sortBy") || "dateJoined";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 15;
  const joinedDate = searchParams.get("joinedDate") || "";

  const filters = useMemo<UseModerateUsersFilters>(
    () => ({ search, role, status, sortBy, sortOrder, page, pageSize, joinedDate }),
    [search, role, status, sortBy, sortOrder, page, pageSize, joinedDate]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const appToast = useAppToast();

  const { data, isLoading } = useModerateUsers(filters);

  const bulkActivateMutation = useBulkActivateUsers();
  const bulkSuspendMutation = useBulkSuspendUsers();
  const bulkBanMutation = useBulkBanUsers();

  const handleBulkActivate = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to activate the ${selectedIds.length} selected user accounts?`)) {
      bulkActivateMutation.mutate(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
        }
      });
    }
  };

  const handleBulkSuspend = () => {
    if (selectedIds.length === 0) return;
    const reason = window.prompt(`Enter suspension reason for ${selectedIds.length} selected users:`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert("A reason is required to suspend accounts.");
      return;
    }
    bulkSuspendMutation.mutate({ userIds: selectedIds, reason }, {
      onSuccess: () => {
        setSelectedIds([]);
      }
    });
  };

  const handleBulkBan = () => {
    if (selectedIds.length === 0) return;
    const reason = window.prompt(`Enter ban reason for ${selectedIds.length} selected users:`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert("A reason is required to ban accounts.");
      return;
    }
    bulkBanMutation.mutate({ userIds: selectedIds, reason }, {
      onSuccess: () => {
        setSelectedIds([]);
      }
    });
  };

  const handleFilterChange = useCallback((newFilters: Partial<UseModerateUsersFilters>) => {
    setFilters(newFilters);
    setSelectedIds([]);
  }, [setFilters]);

  const handlePageChange = (page: number) => {
    setFilters({ page } as Partial<UseModerateUsersFilters>);
    setSelectedIds([]); // Clear selection when page changes
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ pageSize, page: 1 } as Partial<UseModerateUsersFilters>);
    setSelectedIds([]); 
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedIds(data.data.map((user) => user.id));
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
      const blob = await exportUsersApi(filters, selectedIds);
      
      // Client-side download trigger
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const dateStr = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `mazadzone_users_export_${dateStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      appToast.success("Export Successful", "Your user data export has been downloaded.");
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
            Moderate Users
          </h1>
          <span title="Review and manage user accounts and account statuses">
            <Info className="h-5 w-5 text-muted-foreground cursor-help opacity-70 hover:opacity-100 transition-opacity" />
          </span>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Review and manage user accounts and account statuses.
        </p>
      </div>

      {/* Filters Bar */}
      <ModerateUsersFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        isExporting={isExporting}
        onExport={handleExport}
        selectedIds={selectedIds}
        onBulkActivate={handleBulkActivate}
        onBulkSuspend={handleBulkSuspend}
        onBulkBan={handleBulkBan}
      />

      {/* Data Table */}
      <ModerateUsersTable 
        users={data?.data || []} 
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

